using System;
using System.IO;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Villa7.Application.Interfaces;
using Villa7.Application.Services;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Xunit;

namespace Villa7.UnitTests.Storage;

public class HabitacionImageServiceTests
{
    private readonly Mock<IHabitacionRepository> _habitacionRepoMock;
    private readonly Mock<IStorageService> _storageServiceMock;
    private readonly HabitacionImageService _imageService;

    public HabitacionImageServiceTests()
    {
        _habitacionRepoMock = new Mock<IHabitacionRepository>();
        _storageServiceMock = new Mock<IStorageService>();

        _imageService = new HabitacionImageService(
            _habitacionRepoMock.Object,
            _storageServiceMock.Object
        );
    }

    [Fact]
    public async Task UploadImageAsync_WithValidFile_ShouldUploadToStorageAndSaveInDb()
    {
        // Arrange
        var roomGuid = Guid.NewGuid();
        var stream = new MemoryStream(new byte[100]);
        var fileName = "photo.png";
        var contentType = "image/png";
        var length = 100L;

        var room = new Habitacion { Id = roomGuid, Nombre = "Cabaña A", Activa = true };

        _storageServiceMock.Setup(s => s.BucketExistsAsync("habitaciones")).ReturnsAsync(true);
        _habitacionRepoMock.Setup(r => r.GetByIdAsync(roomGuid)).ReturnsAsync(room);
        _storageServiceMock.Setup(s => s.UploadFileAsync("habitaciones", It.IsAny<string>(), stream, contentType))
            .ReturnsAsync("https://supabase.co/storage/v1/object/public/habitaciones/unique-name.png");

        // Act
        var result = await _imageService.UploadImageAsync(roomGuid, stream, fileName, contentType, length);

        // Assert
        result.Should().NotBeNull();
        result.ImagenUrl.Should().Be("https://supabase.co/storage/v1/object/public/habitaciones/unique-name.png");
        result.ImagenStoragePath.Should().StartWith("habitaciones/");

        _habitacionRepoMock.Verify(r => r.UpdateAsync(It.Is<Habitacion>(h => 
            h.ImagenUrl == "https://supabase.co/storage/v1/object/public/habitaciones/unique-name.png" && 
            h.ImagenStoragePath.StartsWith("habitaciones/"))), Times.Once);
    }

    [Fact]
    public async Task UploadImageAsync_WithInvalidExtension_ShouldThrowArgumentException()
    {
        // Arrange
        var roomGuid = Guid.NewGuid();
        var stream = new MemoryStream(new byte[100]);
        var fileName = "document.pdf";
        var contentType = "application/pdf";
        var length = 100L;

        // Act
        Func<Task> act = async () => await _imageService.UploadImageAsync(roomGuid, stream, fileName, contentType, length);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Formato de imagen inválido. Solo se admiten archivos .jpg, .jpeg, .png y .webp.");
    }

    [Fact]
    public async Task UploadImageAsync_WithExcessiveSize_ShouldThrowArgumentException()
    {
        // Arrange
        var roomGuid = Guid.NewGuid();
        var stream = new MemoryStream(new byte[100]);
        var fileName = "large.png";
        var contentType = "image/png";
        var length = 6 * 1024 * 1024; // 6 MB

        // Act
        Func<Task> act = async () => await _imageService.UploadImageAsync(roomGuid, stream, fileName, contentType, length);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("El archivo excede el tamaño máximo permitido de 5 MB.");
    }

    [Fact]
    public async Task UploadImageAsync_WhenBucketDoesNotExist_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var roomGuid = Guid.NewGuid();
        var stream = new MemoryStream(new byte[100]);
        var fileName = "photo.png";
        var contentType = "image/png";
        var length = 100L;

        _storageServiceMock.Setup(s => s.BucketExistsAsync("habitaciones")).ReturnsAsync(false);

        // Act
        Func<Task> act = async () => await _imageService.UploadImageAsync(roomGuid, stream, fileName, contentType, length);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("El bucket de almacenamiento 'habitaciones' no existe en Supabase. Debe crearse manualmente.");
    }

    [Fact]
    public async Task UploadImageAsync_WhenDatabaseFails_ShouldRollbackByDeletingUploadedFile()
    {
        // Arrange
        var roomGuid = Guid.NewGuid();
        var stream = new MemoryStream(new byte[100]);
        var fileName = "photo.png";
        var contentType = "image/png";
        var length = 100L;

        var room = new Habitacion { Id = roomGuid, Nombre = "Cabaña B", Activa = true };

        _storageServiceMock.Setup(s => s.BucketExistsAsync("habitaciones")).ReturnsAsync(true);
        _habitacionRepoMock.Setup(r => r.GetByIdAsync(roomGuid)).ReturnsAsync(room);
        _storageServiceMock.Setup(s => s.UploadFileAsync("habitaciones", It.IsAny<string>(), stream, contentType))
            .ReturnsAsync("https://supabase.co/storage/v1/object/public/habitaciones/new-unique.png");

        _habitacionRepoMock.Setup(r => r.UpdateAsync(room)).ThrowsAsync(new Exception("Database connection failure"));

        // Act
        Func<Task> act = async () => await _imageService.UploadImageAsync(roomGuid, stream, fileName, contentType, length);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("*La operación fue revertida.*");

        // Verify that storage service Delete was called to rollback the file
        _storageServiceMock.Verify(s => s.DeleteFileAsync("habitaciones", It.IsAny<string>()), Times.Once);
    }

    [Fact]
    public async Task UploadImageAsync_WhenReplacingExistingImage_ShouldDeleteOldFileFromStorage()
    {
        // Arrange
        var roomGuid = Guid.NewGuid();
        var stream = new MemoryStream(new byte[100]);
        var fileName = "new.png";
        var contentType = "image/png";
        var length = 100L;

        var room = new Habitacion 
        { 
            Id = roomGuid, 
            Nombre = "Cabaña C", 
            Activa = true,
            ImagenUrl = "https://supabase.co/storage/v1/object/public/habitaciones/old-name.png",
            ImagenStoragePath = "habitaciones/old-name.png"
        };

        _storageServiceMock.Setup(s => s.BucketExistsAsync("habitaciones")).ReturnsAsync(true);
        _habitacionRepoMock.Setup(r => r.GetByIdAsync(roomGuid)).ReturnsAsync(room);
        _storageServiceMock.Setup(s => s.UploadFileAsync("habitaciones", It.IsAny<string>(), stream, contentType))
            .ReturnsAsync("https://supabase.co/storage/v1/object/public/habitaciones/new-name.png");

        // Act
        await _imageService.UploadImageAsync(roomGuid, stream, fileName, contentType, length);

        // Assert
        // Verify old file was deleted
        _storageServiceMock.Verify(s => s.DeleteFileAsync("habitaciones", "old-name.png"), Times.Once);
    }

    [Fact]
    public async Task DeleteImageAsync_WithExistingImage_ShouldClearDatabaseFieldsAndRemoveFileFromStorage()
    {
        // Arrange
        var roomGuid = Guid.NewGuid();
        var room = new Habitacion 
        { 
            Id = roomGuid, 
            Nombre = "Cabaña D", 
            Activa = true,
            ImagenUrl = "https://supabase.co/storage/v1/object/public/habitaciones/photo.png",
            ImagenStoragePath = "habitaciones/photo.png"
        };

        _habitacionRepoMock.Setup(r => r.GetByIdAsync(roomGuid)).ReturnsAsync(room);

        // Act
        var result = await _imageService.DeleteImageAsync(roomGuid);

        // Assert
        result.Should().NotBeNull();
        result.ImagenUrl.Should().BeNull();
        result.ImagenStoragePath.Should().BeNull();

        room.ImagenUrl.Should().BeNull();
        room.ImagenStoragePath.Should().BeNull();

        _habitacionRepoMock.Verify(r => r.UpdateAsync(room), Times.Once);
        _storageServiceMock.Verify(s => s.DeleteFileAsync("habitaciones", "photo.png"), Times.Once);
    }
}
