using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Villa7.Application.Services;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Xunit;

using Villa7.Domain.Exceptions;

namespace Villa7.UnitTests.Clientes;

public class ClienteServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepoMock;
    private readonly Mock<IAuditoriaRepository> _auditoriaRepoMock;
    private readonly ClienteService _clienteService;

    public ClienteServiceTests()
    {
        _usuarioRepoMock = new Mock<IUsuarioRepository>();
        _auditoriaRepoMock = new Mock<IAuditoriaRepository>();
        _clienteService = new ClienteService(_usuarioRepoMock.Object, _auditoriaRepoMock.Object);
    }

    [Fact]
    public async Task ListClientesAsync_ShouldReturnMappedDtos()
    {
        // Arrange
        var clientesList = new List<Usuario>
        {
            new Usuario { Id = Guid.NewGuid(), Nombre = "Juan Perez", Correo = "juan@test.com", Rol = "Cliente", FechaCreacion = DateTime.UtcNow },
            new Usuario { Id = Guid.NewGuid(), Nombre = "Maria Lopez", Correo = "maria@test.com", Rol = "Cliente", FechaCreacion = DateTime.UtcNow }
        };

        _usuarioRepoMock.Setup(r => r.ListClientesAsync()).ReturnsAsync(clientesList);

        // Act
        var result = await _clienteService.ListClientesAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().HaveCount(2);
        result[0].Nombre.Should().Be("Juan Perez");
        result[0].Correo.Should().Be("juan@test.com");
        result[1].Nombre.Should().Be("Maria Lopez");
        result[1].Correo.Should().Be("maria@test.com");
    }

    [Fact]
    public async Task GetByIdAsync_WithExistingCliente_ShouldReturnClienteDto()
    {
        // Arrange
        var id = Guid.NewGuid();
        var cliente = new Usuario
        {
            Id = id,
            Nombre = "Carlos Perez",
            Correo = "carlos@test.com",
            Rol = "Cliente",
            FechaCreacion = DateTime.UtcNow
        };

        _usuarioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(cliente);

        // Act
        var result = await _clienteService.GetByIdAsync(id);

        // Assert
        result.Should().NotBeNull();
        result.Id.Should().Be(id);
        result.Nombre.Should().Be("Carlos Perez");
        result.Correo.Should().Be("carlos@test.com");
    }

    [Fact]
    public async Task GetByIdAsync_WithAdminUser_ShouldReturnNull()
    {
        // Arrange
        var id = Guid.NewGuid();
        var admin = new Usuario
        {
            Id = id,
            Nombre = "Admin User",
            Correo = "admin@test.com",
            Rol = "Administrador",
            FechaCreacion = DateTime.UtcNow
        };

        _usuarioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(admin);

        // Act
        var result = await _clienteService.GetByIdAsync(id);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetByIdAsync_WithNonExistentUser_ShouldReturnNull()
    {
        // Arrange
        var id = Guid.NewGuid();
        _usuarioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync((Usuario)null);

        // Act
        var result = await _clienteService.GetByIdAsync(id);

        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task DeleteAsync_InactiveAndNoBookings_ShouldDeleteSuccessfullyAndRegisterAudit()
    {
        // Arrange
        var id = Guid.NewGuid();
        var client = new Usuario { Id = id, Nombre = "Esteban", Rol = "Cliente", Activo = false };
        _usuarioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(client);
        _usuarioRepoMock.Setup(r => r.HasAnyBookingsAsync(id)).ReturnsAsync(false);

        // Act
        await _clienteService.DeleteAsync(id, "admin@test.com", "127.0.0.1", "Borrado Cliente");

        // Assert
        _usuarioRepoMock.Verify(r => r.DeleteAsync(client), Times.Once);
        _auditoriaRepoMock.Verify(a => a.RegistrarEliminacionAsync(It.Is<AuditoriaEliminacion>(x => 
            x.Entidad == "Cliente" && 
            x.EntidadId == id && 
            x.Nombre == "Esteban" && 
            x.Administrador == "admin@test.com" &&
            x.Ip == "127.0.0.1" &&
            x.Motivo == "Borrado Cliente"
        )), Times.Once);
    }

    [Fact]
    public async Task DeleteAsync_WhenActive_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var client = new Usuario { Id = id, Nombre = "Mario", Rol = "Cliente", Activo = true };
        _usuarioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(client);

        // Act
        Func<Task> act = async () => await _clienteService.DeleteAsync(id, "admin@test.com", null, null);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("No se puede eliminar un cliente activo. Debe desactivarse primero.");
        _usuarioRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Usuario>()), Times.Never);
    }

    [Fact]
    public async Task DeleteAsync_WhenHasBookings_ShouldThrowBusinessRuleException()
    {
        // Arrange
        var id = Guid.NewGuid();
        var client = new Usuario { Id = id, Nombre = "Mario", Rol = "Cliente", Activo = false };
        _usuarioRepoMock.Setup(r => r.GetByIdAsync(id)).ReturnsAsync(client);
        _usuarioRepoMock.Setup(r => r.HasAnyBookingsAsync(id)).ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _clienteService.DeleteAsync(id, "admin@test.com", null, null);

        // Assert
        await act.Should().ThrowAsync<BusinessRuleException>()
            .WithMessage("No es posible eliminar un cliente que posee reservas asociadas.");
        _usuarioRepoMock.Verify(r => r.DeleteAsync(It.IsAny<Usuario>()), Times.Never);
    }
}
