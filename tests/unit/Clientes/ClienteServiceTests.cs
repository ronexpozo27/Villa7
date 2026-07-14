using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using FluentAssertions;
using Moq;
using Villa7.Application.Services;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Xunit;

namespace Villa7.UnitTests.Clientes;

public class ClienteServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepoMock;
    private readonly ClienteService _clienteService;

    public ClienteServiceTests()
    {
        _usuarioRepoMock = new Mock<IUsuarioRepository>();
        _clienteService = new ClienteService(_usuarioRepoMock.Object);
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
}
