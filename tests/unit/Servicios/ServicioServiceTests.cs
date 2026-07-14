using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Villa7.Application.DTOs.Servicio;
using Villa7.Application.Services;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Xunit;

using Villa7.Domain.Exceptions;

namespace Villa7.UnitTests.Servicios;

public class ServicioServiceTests
{
    private readonly Mock<IServicioRepository> _servicioRepoMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepoMock;
    private readonly ServicioService _servicioService;

    public ServicioServiceTests()
    {
        _servicioRepoMock = new Mock<IServicioRepository>();
        _auditoriaRepoMock = new Mock<IAuditoriaRepository>();
        _servicioService = new ServicioService(_servicioRepoMock.Object, _auditoriaRepoMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateServiceAndReturnDto()
    {
        // Arrange
        var dto = new CrearServicioDto
        {
            Nombre = "Paseo a Caballo",
            Descripcion = "Recorrido guiado por el bosque",
            Precio = 45.00m
        };

        _servicioRepoMock.Setup(r => r.NombreExistsAsync(dto.Nombre)).ReturnsAsync(false);

        // Act
        var result = await _servicioService.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Nombre.Should().Be("Paseo a Caballo");
        result.Descripcion.Should().Be("Recorrido guiado por el bosque");
        result.Precio.Should().Be(45.00m);
        result.Activo.Should().BeTrue();

        _servicioRepoMock.Verify(r => r.AddAsync(It.Is<Servicio>(s => 
            s.Nombre == "Paseo a Caballo" && 
            s.Precio == 45.00m && 
            s.Activo)), Times.Once);
    }

    [Theory]
    [InlineData(null, 20.00)]
    [InlineData("", 20.00)]
    [InlineData("Servicio", -5.00)]
    public async Task CreateAsync_WithInvalidParameters_ShouldThrowArgumentException(string nombre, decimal precio)
    {
        // Arrange
        var dto = new CrearServicioDto
        {
            Nombre = nombre,
            Precio = precio
        };

        // Act
        Func<Task> act = async () => await _servicioService.CreateAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var dto = new CrearServicioDto { Nombre = "Servicio Repetido", Precio = 25.00m };
        _servicioRepoMock.Setup(r => r.NombreExistsAsync("Servicio Repetido")).ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _servicioService.CreateAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Ya existe un servicio registrado con este nombre.");
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldModifyService()
    {
        // Arrange
        var id = Guid.NewGuid();
        var servicio = new Servicio
        {
            Id = id,
            Nombre = "Masajes",
            Descripcion = "Antiguo",
            Precio = 60.00m,
            Activo = true
        };

        var dto = new EditarServicioDto
        {
            Nombre = "Masajes Terapéuticos",
            Descripcion = "Nuevo masaje de relajación",
            Precio = 70.00m
        };

        _servicioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(servicio);
        _servicioRepoMock.Setup(r => r.NombreExistsAsync("Masajes Terapéuticos", id)).ReturnsAsync(false);

        // Act
        await _servicioService.UpdateAsync(id, dto);

        // Assert
        servicio.Nombre.Should().Be("Masajes Terapéuticos");
        servicio.Descripcion.Should().Be("Nuevo masaje de relajación");
        servicio.Precio.Should().Be(70.00m);

        _servicioRepoMock.Verify(r => r.UpdateAsync(servicio), Times.Once);
    }

    [Fact]
    public async Task ToggleStatusAsync_ShouldChangeServiceStatus()
    {
        // Arrange
        var id = Guid.NewGuid();
        var servicio = new Servicio { Id = id, Nombre = "Catering", Activo = true };
        _servicioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(servicio);

        // Act
        await _servicioService.ToggleStatusAsync(id, false);

        // Assert
        servicio.Activo.Should().BeFalse();
        _servicioRepoMock.Verify(r => r.UpdateAsync(servicio), Times.Once);
    }

    [Fact]
    public async Task ToggleStatusAsync_WithNonExistentId_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var id = Guid.NewGuid();
        _servicioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Servicio)null);

        // Act
        Func<Task> act = async () => await _servicioService.ToggleStatusAsync(id, false);

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("El servicio solicitado no existe.");
    }

    [Fact]
    public async Task DeleteAsync_InactiveAndNoBookings_ShouldDeleteSuccessfullyAndRegisterAudit()
    {
        // Arrange
        var id = Guid.NewGuid();
        var servicio = new Servicio { Id = id, Nombre = "Paseo en bote", Activo = false };
        _servicioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(servicio);
        _servicioRepoMock.Setup(r => r.HasBookingsAsync(id)).ReturnsAsync(false);

        // Act
        await _servicioService.DeleteAsync(id, "admin@test.com", "127.0.0.1", "Borrado E2E");

        // Assert
        _servicioRepoMock.Verify(r => r.DeleteAsync(servicio), Times.Once);
        _auditoriaRepoMock.Verify(a => a.RegistrarEliminacionAsync(It.Is<AuditoriaEliminacion>(x => 
            x.Entidad == "Servicio" && 
            x.EntidadId == id && 
            x.Nombre == "Paseo en bote" && 
            x.Administrador == "admin@test.com" &&
            x.Ip == "127.0.0.1" &&
            x.Motivo == "Borrado E2E"
        )), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenActive_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var servicio = new Servicio { Id = id, Nombre = "Spa", Activo = true };
        _servicioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(servicio);

        // Act
        Func<Task> act = async () => await _servicioService.DeleteAsync(id, "admin@test.com", null, null);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("No se puede eliminar un servicio activo. Debe desactivarse primero.");
        _servicioRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Servicio>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WhenHasBookings_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var servicio = new Servicio { Id = id, Nombre = "Almuerzo", Activo = false };
        _servicioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(servicio);
        _servicioRepoMock.Setup(r => r.HasBookingsAsync(id)).ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _servicioService.DeleteAsync(id, "admin@test.com", null, null);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("No es posible eliminar un servicio que posee reservas asociadas.");
        _servicioRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Servicio>()), Times.Never);
    }
}
