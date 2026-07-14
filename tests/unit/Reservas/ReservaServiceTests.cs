using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Villa7.Application.DTOs.Reserva;
using Villa7.Application.Services;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Xunit;

namespace Villa7.UnitTests.Reservas;

public class ReservaServiceTests
{
    private readonly Mock<IReservaRepository> _reservaRepoMock;
    private readonly Mock<IHabitacionRepository> _habitacionRepoMock;
    private readonly Mock<IServicioRepository> _servicioRepoMock;
    private readonly Mock<IDbTransaction> _transactionMock;
    private readonly ReservaService _reservaService;

    public ReservaServiceTests()
    {
        _reservaRepoMock = new Mock<IReservaRepository>();
        _habitacionRepoMock = new Mock<IHabitacionRepository>();
        _servicioRepoMock = new Mock<IServicioRepository>();
        _transactionMock = new Mock<IDbTransaction>();

        _reservaRepoMock.Setup(r => r.BeginTransactionAsync()).ReturnsAsync(_transactionMock.Object);

        _reservaService = new ReservaService(
            _reservaRepoMock.Object,
            _habitacionRepoMock.Object,
            _servicioRepoMock.Object
        );
    }

    [Fact]
    public async Task CreateAsync_WithValidDetails_ShouldCalculateTotalCorrectlyAndPersist()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();
        var habitacionId = Guid.NewGuid();
        var servicioId = Guid.NewGuid();

        var dto = new CrearReservaDto
        {
            HabitacionId = habitacionId,
            FechaEntrada = DateTime.UtcNow.AddDays(1),
            FechaSalida = DateTime.UtcNow.AddDays(3), // 2 nights
            ServiciosIds = new List<Guid> { servicioId }
        };

        var habitacion = new Habitacion { Id = habitacionId, PrecioPorNoche = 120.00m, Activa = true };
        var servicio = new Servicio { Id = servicioId, Precio = 45.00m, Activo = true };

        _habitacionRepoMock.Setup(r => r.GetByIdAsync(habitacionId)).ReturnsAsync(habitacion);
        _reservaRepoMock.Setup(r => r.IsRoomAvailableAsync(habitacionId, dto.FechaEntrada.Date, dto.FechaSalida.Date)).ReturnsAsync(true);
        _servicioRepoMock.Setup(r => r.GetByIdAsync(servicioId)).ReturnsAsync(servicio);

        // Mock detail mapping return
        var savedReserva = new Reserva
        {
            Id = Guid.NewGuid(),
            UsuarioId = usuarioId,
            HabitacionId = habitacionId,
            FechaEntrada = dto.FechaEntrada.Date,
            FechaSalida = dto.FechaSalida.Date,
            Estado = "Pendiente",
            TotalCalculado = 285.00m, // 120 * 2 + 45 = 240 + 45 = 285
            ReservaServicios = new List<ReservaServicio>
            {
                new ReservaServicio { ServicioId = servicioId, PrecioContratado = 45.00m, Servicio = servicio }
            }
        };

        _reservaRepoMock.Setup(r => r.GetByIdWithDetailsAsync(It.IsAny<Guid>())).ReturnsAsync(savedReserva);

        // Act
        var result = await _reservaService.CreateAsync(usuarioId, dto);

        // Assert
        result.Should().NotBeNull();
        result.TotalCalculado.Should().Be(285.00m); // 2 nights x 120 + 45 = 285
        result.Estado.Should().Be("Pendiente");
        
        _reservaRepoMock.Verify(r => r.AddAsync(It.Is<Reserva>(res => 
            res.TotalCalculado == 285.00m && 
            res.Estado == "Pendiente" && 
            res.HabitacionId == habitacionId && 
            res.UsuarioId == usuarioId)), Times.Once);

        _transactionMock.Verify(t => t.CommitAsync(), Times.Once);
        _transactionMock.Verify(t => t.RollbackAsync(), Times.Never);
    }

    [Fact]
    public async Task CreateAsync_WithDoubleBooking_ShouldThrowInvalidOperationExceptionAndRollback()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();
        var habitacionId = Guid.NewGuid();
        var dto = new CrearReservaDto
        {
            HabitacionId = habitacionId,
            FechaEntrada = DateTime.UtcNow.AddDays(1),
            FechaSalida = DateTime.UtcNow.AddDays(3),
            ServiciosIds = new List<Guid>()
        };

        var habitacion = new Habitacion { Id = habitacionId, PrecioPorNoche = 100.00m, Activa = true };
        _habitacionRepoMock.Setup(r => r.GetByIdAsync(habitacionId)).ReturnsAsync(habitacion);
        _reservaRepoMock.Setup(r => r.IsRoomAvailableAsync(habitacionId, dto.FechaEntrada.Date, dto.FechaSalida.Date)).ReturnsAsync(false); // Double booking

        // Act
        Func<Task> act = async () => await _reservaService.CreateAsync(usuarioId, dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("La habitación seleccionada no se encuentra disponible para el rango de fechas solicitado.");

        _transactionMock.Verify(t => t.CommitAsync(), Times.Never);
        _transactionMock.Verify(t => t.RollbackAsync(), Times.Once);
    }

    [Fact]
    public async Task CreateAsync_WithPastDates_ShouldThrowArgumentException()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();
        var dto = new CrearReservaDto
        {
            HabitacionId = Guid.NewGuid(),
            FechaEntrada = DateTime.UtcNow.AddDays(-1),
            FechaSalida = DateTime.UtcNow.AddDays(2)
        };

        // Act
        Func<Task> act = async () => await _reservaService.CreateAsync(usuarioId, dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("La fecha de entrada no puede ser en el pasado.");
    }

    [Fact]
    public async Task CreateAsync_WithCheckoutBeforeCheckin_ShouldThrowArgumentException()
    {
        // Arrange
        var usuarioId = Guid.NewGuid();
        var dto = new CrearReservaDto
        {
            HabitacionId = Guid.NewGuid(),
            FechaEntrada = DateTime.UtcNow.AddDays(2),
            FechaSalida = DateTime.UtcNow.AddDays(1)
        };

        // Act
        Func<Task> act = async () => await _reservaService.CreateAsync(usuarioId, dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("La fecha de salida debe ser posterior a la fecha de entrada.");
    }

    [Fact]
    public async Task CancelByClientAsync_ByOwnerWhenPendiente_ShouldChangeStatusToCancelada()
    {
        // Arrange
        var id = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var reserva = new Reserva
        {
            Id = id,
            UsuarioId = usuarioId,
            Estado = "Pendiente"
        };

        _reservaRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(reserva);

        // Act
        await _reservaService.CancelByClientAsync(id, usuarioId);

        // Assert
        reserva.Estado.Should().Be("Cancelada");
        reserva.FechaCancelacion.Should().NotBeNull();
        _reservaRepoMock.Verify(r => r.UpdateAsync(reserva), Times.Once);
    }

    [Fact]
    public async Task CancelByClientAsync_ByNonOwner_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var ownerId = Guid.NewGuid();
        var otherUserId = Guid.NewGuid();
        var reserva = new Reserva { Id = id, UsuarioId = ownerId, Estado = "Pendiente" };

        _reservaRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(reserva);

        // Act
        Func<Task> act = async () => await _reservaService.CancelByClientAsync(id, otherUserId);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>();
    }

    [Fact]
    public async Task CancelByClientAsync_WhenAlreadyConfirmada_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var usuarioId = Guid.NewGuid();
        var reserva = new Reserva { Id = id, UsuarioId = usuarioId, Estado = "Confirmada" };

        _reservaRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(reserva);

        // Act
        Func<Task> act = async () => await _reservaService.CancelByClientAsync(id, usuarioId);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("No se puede cancelar una reserva que no esté en estado 'Pendiente'.");
    }

    [Theory]
    [InlineData("Pendiente", "Completada", false)]
    [InlineData("Pendiente", "Confirmada", true)]
    [InlineData("Confirmada", "Completada", true)]
    [InlineData("Confirmada", "Cancelada", true)]
    [InlineData("Cancelada", "Pendiente", false)]
    public async Task ChangeStatusAsync_ShouldValidateStateTransitions(string originalState, string targetState, bool shouldSucceed)
    {
        // Arrange
        var id = Guid.NewGuid();
        var reserva = new Reserva { Id = id, Estado = originalState };
        _reservaRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(reserva);

        // Act
        Func<Task> act = async () => await _reservaService.ChangeStatusAsync(id, targetState);

        // Assert
        if (shouldSucceed)
        {
            await act.Should().NotThrowAsync();
            reserva.Estado.Should().Be(targetState);
            _reservaRepoMock.Verify(r => r.UpdateAsync(reserva), Times.Once);
        }
        else
        {
            await act.Should().ThrowAsync<InvalidOperationException>();
        }
    }
}
