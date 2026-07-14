using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Villa7.Application.DTOs.Habitacion;
using Villa7.Application.Services;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Xunit;

namespace Villa7.UnitTests.Habitaciones;

public class HabitacionServiceTests
{
    private readonly Mock<IHabitacionRepository> _habitacionRepoMock;
    private readonly HabitacionService _habitacionService;

    public HabitacionServiceTests()
    {
        _habitacionRepoMock = new Mock<IHabitacionRepository>();
        _habitacionService = new HabitacionService(_habitacionRepoMock.Object);
    }

    [Fact]
    public async Task CreateAsync_WithValidData_ShouldCreateRoomAndReturnDto()
    {
        // Arrange
        var dto = new CrearHabitacionDto
        {
            Nombre = "Cabaña Vista Sol",
            Descripcion = "Bonita cabaña soleada",
            CapacidadMax = 4,
            PrecioPorNoche = 250.00m,
            Ubicacion = "Parque Central"
        };

        _habitacionRepoMock.Setup(r => r.NombreExistsAsync(dto.Nombre)).ReturnsAsync(false);

        // Act
        var result = await _habitacionService.CreateAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.Nombre.Should().Be("Cabaña Vista Sol");
        result.CapacidadMax.Should().Be(4);
        result.PrecioPorNoche.Should().Be(250.00m);
        result.Ubicacion.Should().Be("Parque Central");
        result.Activa.Should().BeTrue();

        _habitacionRepoMock.Verify(r => r.AddAsync(It.Is<Habitacion>(h => 
            h.Nombre == "Cabaña Vista Sol" && 
            h.CapacidadMax == 4 && 
            h.PrecioPorNoche == 250.00m && 
            h.Ubicacion == "Parque Central" && 
            h.Activa)), Times.Once);
    }

    [Theory]
    [InlineData(null, 4, 150.00)]
    [InlineData("", 4, 150.00)]
    [InlineData("Cabaña", 0, 150.00)]
    [InlineData("Cabaña", -1, 150.00)]
    [InlineData("Cabaña", 4, 0.00)]
    [InlineData("Cabaña", 4, -50.00)]
    public async Task CreateAsync_WithInvalidParameters_ShouldThrowArgumentException(string nombre, int capacidadMax, decimal precioPorNoche)
    {
        // Arrange
        var dto = new CrearHabitacionDto
        {
            Nombre = nombre,
            CapacidadMax = capacidadMax,
            PrecioPorNoche = precioPorNoche
        };

        // Act
        Func<Task> act = async () => await _habitacionService.CreateAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>();
    }

    [Fact]
    public async Task CreateAsync_WithDuplicateName_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var dto = new CrearHabitacionDto { Nombre = "Cabaña Existente", CapacidadMax = 2, PrecioPorNoche = 100.00m };
        _habitacionRepoMock.Setup(r => r.NombreExistsAsync("Cabaña Existente")).ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _habitacionService.CreateAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("Ya existe una habitación registrada con este nombre.");
    }

    [Fact]
    public async Task UpdateAsync_WithValidData_ShouldModifyExistingRoom()
    {
        // Arrange
        var id = Guid.NewGuid();
        var habitacion = new Habitacion
        {
            Id = id,
            Nombre = "Nombre Viejo",
            Descripcion = "Desc vieja",
            CapacidadMax = 2,
            PrecioPorNoche = 100.00m,
            Activa = true
        };

        var dto = new EditarHabitacionDto
        {
            Nombre = "Nombre Nuevo",
            Descripcion = "Desc nueva",
            CapacidadMax = 3,
            PrecioPorNoche = 150.00m,
            Ubicacion = "Nueva Ubicacion"
        };

        _habitacionRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(habitacion);
        _habitacionRepoMock.Setup(r => r.NombreExistsAsync("Nombre Nuevo", id)).ReturnsAsync(false);

        // Act
        await _habitacionService.UpdateAsync(id, dto);

        // Assert
        habitacion.Nombre.Should().Be("Nombre Nuevo");
        habitacion.Descripcion.Should().Be("Desc nueva");
        habitacion.CapacidadMax.Should().Be(3);
        habitacion.PrecioPorNoche.Should().Be(150.00m);
        habitacion.Ubicacion.Should().Be("Nueva Ubicacion");

        _habitacionRepoMock.Verify(r => r.UpdateAsync(habitacion), Times.Once);
    }

    [Fact]
    public async Task UpdateAsync_WithNonExistentId_ShouldThrowKeyNotFoundException()
    {
        // Arrange
        var id = Guid.NewGuid();
        _habitacionRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Habitacion)null);

        // Act
        Func<Task> act = async () => await _habitacionService.UpdateAsync(id, new EditarHabitacionDto { Nombre = "Hab", CapacidadMax = 2, PrecioPorNoche = 100 });

        // Assert
        await act.Should().ThrowAsync<KeyNotFoundException>()
            .WithMessage("La habitación solicitada no existe.");
    }

    [Fact]
    public async Task ToggleStatusAsync_ToFalseWithFutureBookings_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var habitacion = new Habitacion { Id = id, Nombre = "Cabaña Reservada", Activa = true };
        _habitacionRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(habitacion);
        _habitacionRepoMock.Setup(r => r.HasFutureBookingsAsync(id)).ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _habitacionService.ToggleStatusAsync(id, false);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("No se puede desactivar la habitación porque tiene reservas pendientes o confirmadas para fechas futuras.");
    }

    [Fact]
    public async Task ToggleStatusAsync_ToFalseWithoutFutureBookings_ShouldSucceed()
    {
        // Arrange
        var id = Guid.NewGuid();
        var habitacion = new Habitacion { Id = id, Nombre = "Cabaña Reservada", Activa = true };
        _habitacionRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(habitacion);
        _habitacionRepoMock.Setup(r => r.HasFutureBookingsAsync(id)).ReturnsAsync(false);

        // Act
        await _habitacionService.ToggleStatusAsync(id, false);

        // Assert
        habitacion.Activa.Should().BeFalse();
        _habitacionRepoMock.Verify(r => r.UpdateAsync(habitacion), Times.Once);
    }

    [Fact]
    public async Task ListActiveAsync_WithPastEntryDate_ShouldThrowArgumentException()
    {
        // Arrange
        var entrada = DateTime.UtcNow.AddDays(-1);
        var salida = DateTime.UtcNow.AddDays(1);

        // Act
        Func<Task> act = async () => await _habitacionService.ListActiveAsync(entrada, salida);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("La fecha de entrada no puede ser en el pasado.");
    }

    [Fact]
    public async Task ListActiveAsync_WithCheckoutBeforeCheckin_ShouldThrowArgumentException()
    {
        // Arrange
        var entrada = DateTime.UtcNow.AddDays(2);
        var salida = DateTime.UtcNow.AddDays(1);

        // Act
        Func<Task> act = async () => await _habitacionService.ListActiveAsync(entrada, salida);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("La fecha de salida debe ser posterior a la fecha de entrada.");
    }
}
