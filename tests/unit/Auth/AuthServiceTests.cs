using System;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.Extensions.Configuration;
using Moq;
using Villa7.Application.DTOs.Auth;
using Villa7.Application.Services;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Domain.Interfaces.Security;
using Villa7.Infrastructure.Security;
using Xunit;

namespace Villa7.UnitTests.Auth;

public class AuthServiceTests
{
    private readonly Mock<IUsuarioRepository> _usuarioRepoMock;
    private readonly Mock<ITokenService> _tokenServiceMock;
    private readonly Mock<IPasswordHasher> _passwordHasherMock;
    private readonly AuthService _authService;

    public AuthServiceTests()
    {
        _usuarioRepoMock = new Mock<IUsuarioRepository>();
        _tokenServiceMock = new Mock<ITokenService>();
        _passwordHasherMock = new Mock<IPasswordHasher>();
        
        _authService = new AuthService(
            _usuarioRepoMock.Object,
            _tokenServiceMock.Object,
            _passwordHasherMock.Object
        );
    }

    [Fact]
    public async Task RegisterAsync_WithValidData_ShouldCreateUserAndReturnTokens()
    {
        // Arrange
        var dto = new RegisterDto
        {
            Nombre = "Juan Perez",
            Correo = "juan.perez@test.com",
            Password = "Password123!"
        };

        _usuarioRepoMock.Setup(r => r.CorreoExistsAsync(It.IsAny<string>())).ReturnsAsync(false);
        _passwordHasherMock.Setup(h => h.Hash(dto.Password)).Returns("HashedPassword");
        _tokenServiceMock.Setup(t => t.GenerateAccessToken(It.IsAny<Usuario>())).Returns("AccessToken");
        _tokenServiceMock.Setup(t => t.GenerateRefreshToken()).Returns("RefreshToken");

        // Act
        var result = await _authService.RegisterAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("AccessToken");
        result.RefreshToken.Should().Be("RefreshToken");
        result.Usuario.Nombre.Should().Be("Juan Perez");
        result.Usuario.Correo.Should().Be("juan.perez@test.com");
        result.Usuario.Rol.Should().Be("Cliente");

        _usuarioRepoMock.Verify(r => r.AddAsync(It.Is<Usuario>(u => 
            u.Nombre == "Juan Perez" && 
            u.Correo == "juan.perez@test.com" && 
            u.PasswordHash == "HashedPassword" &&
            u.Rol == "Cliente")), Times.Once);
        _usuarioRepoMock.Verify(r => r.UpdateAsync(It.Is<Usuario>(u => 
            u.RefreshToken == "RefreshToken")), Times.Once);
    }

    [Theory]
    [InlineData(null, "correo@test.com", "Password123")]
    [InlineData("", "correo@test.com", "Password123")]
    [InlineData("Juan", null, "Password123")]
    [InlineData("Juan", "", "Password123")]
    [InlineData("Juan", "correo@test.com", null)]
    [InlineData("Juan", "correo@test.com", "")]
    public async Task RegisterAsync_WithEmptyFields_ShouldThrowArgumentException(string nombre, string correo, string password)
    {
        // Arrange
        var dto = new RegisterDto { Nombre = nombre, Correo = correo, Password = password };

        // Act
        Func<Task> act = async () => await _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("Todos los campos (nombre, correo, contraseña) son obligatorios.");
    }

    [Theory]
    [InlineData("invalid-email")]
    [InlineData("invalid-email@")]
    [InlineData("@invalid.com")]
    public async Task RegisterAsync_WithInvalidEmailFormat_ShouldThrowArgumentException(string correo)
    {
        // Arrange
        var dto = new RegisterDto { Nombre = "Juan", Correo = correo, Password = "Password123" };

        // Act
        Func<Task> act = async () => await _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("El correo electrónico no posee un formato válido.");
    }

    [Fact]
    public async Task RegisterAsync_WithShortPassword_ShouldThrowArgumentException()
    {
        // Arrange
        var dto = new RegisterDto { Nombre = "Juan", Correo = "juan@test.com", Password = "Short" };

        // Act
        Func<Task> act = async () => await _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<ArgumentException>()
            .WithMessage("La contraseña debe tener al menos 8 caracteres.");
    }

    [Fact]
    public async Task RegisterAsync_WithExistingEmail_ShouldThrowInvalidOperationException()
    {
        // Arrange
        var dto = new RegisterDto { Nombre = "Juan", Correo = "exists@test.com", Password = "Password123!" };
        _usuarioRepoMock.Setup(r => r.CorreoExistsAsync("exists@test.com")).ReturnsAsync(true);

        // Act
        Func<Task> act = async () => await _authService.RegisterAsync(dto);

        // Assert
        await act.Should().ThrowAsync<InvalidOperationException>()
            .WithMessage("El correo electrónico ya está registrado en el sistema.");
    }

    [Fact]
    public async Task LoginAsync_WithValidCredentials_ShouldReturnTokens()
    {
        // Arrange
        var dto = new LoginDto { Correo = "user@test.com", Password = "Password123!" };
        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = "Juan Test",
            Correo = "user@test.com",
            PasswordHash = "HashedPassword",
            Rol = "Cliente"
        };

        _usuarioRepoMock.Setup(r => r.GetByCorreoAsync("user@test.com")).ReturnsAsync(usuario);
        _passwordHasherMock.Setup(h => h.Verify(dto.Password, usuario.PasswordHash)).Returns(true);
        _tokenServiceMock.Setup(t => t.GenerateAccessToken(usuario)).Returns("AccessToken");
        _tokenServiceMock.Setup(t => t.GenerateRefreshToken()).Returns("RefreshToken");

        // Act
        var result = await _authService.LoginAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("AccessToken");
        result.RefreshToken.Should().Be("RefreshToken");
        result.Usuario.Rol.Should().Be("Cliente");

        _usuarioRepoMock.Verify(r => r.UpdateAsync(It.Is<Usuario>(u => u.RefreshToken == "RefreshToken")), Times.Once);
    }

    [Fact]
    public async Task LoginAsync_WithWrongPassword_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var dto = new LoginDto { Correo = "user@test.com", Password = "WrongPassword" };
        var usuario = new Usuario { Correo = "user@test.com", PasswordHash = "HashedPassword" };

        _usuarioRepoMock.Setup(r => r.GetByCorreoAsync("user@test.com")).ReturnsAsync(usuario);
        _passwordHasherMock.Setup(h => h.Verify("WrongPassword", "HashedPassword")).Returns(false);

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(dto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Credenciales inválidas.");
    }

    [Fact]
    public async Task LoginAsync_WithNonExistentUser_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var dto = new LoginDto { Correo = "notfound@test.com", Password = "Password123" };
        _usuarioRepoMock.Setup(r => r.GetByCorreoAsync("notfound@test.com")).ReturnsAsync((Usuario)null);

        // Act
        Func<Task> act = async () => await _authService.LoginAsync(dto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Credenciales inválidas.");
    }

    [Fact]
    public async Task RefreshAsync_WithValidToken_ShouldReturnNewTokens()
    {
        // Arrange
        var dto = new RefreshTokenDto { RefreshToken = "ValidToken" };
        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = "Juan",
            Correo = "juan@test.com",
            Rol = "Cliente",
            RefreshToken = "ValidToken",
            RefreshTokenExpiracion = DateTime.UtcNow.AddHours(2)
        };

        _usuarioRepoMock.Setup(r => r.GetByRefreshTokenAsync("ValidToken")).ReturnsAsync(usuario);
        _tokenServiceMock.Setup(t => t.GenerateAccessToken(usuario)).Returns("NewAccessToken");
        _tokenServiceMock.Setup(t => t.GenerateRefreshToken()).Returns("NewRefreshToken");

        // Act
        var result = await _authService.RefreshAsync(dto);

        // Assert
        result.Should().NotBeNull();
        result.AccessToken.Should().Be("NewAccessToken");
        result.RefreshToken.Should().Be("NewRefreshToken");

        _usuarioRepoMock.Verify(r => r.UpdateAsync(It.Is<Usuario>(u => u.RefreshToken == "NewRefreshToken")), Times.Once);
    }

    [Fact]
    public async Task RefreshAsync_WithExpiredToken_ShouldThrowUnauthorizedAccessException()
    {
        // Arrange
        var dto = new RefreshTokenDto { RefreshToken = "ExpiredToken" };
        var usuario = new Usuario
        {
            RefreshToken = "ExpiredToken",
            RefreshTokenExpiracion = DateTime.UtcNow.AddHours(-1)
        };

        _usuarioRepoMock.Setup(r => r.GetByRefreshTokenAsync("ExpiredToken")).ReturnsAsync(usuario);

        // Act
        Func<Task> act = async () => await _authService.RefreshAsync(dto);

        // Assert
        await act.Should().ThrowAsync<UnauthorizedAccessException>()
            .WithMessage("Sesión expirada o Refresh Token inválido.");
    }
}

public class TokenServiceTests
{
    [Fact]
    public void GenerateAccessToken_ShouldProduceValidSignedJwtToken()
    {
        // Arrange
        var inMemorySettings = new System.Collections.Generic.Dictionary<string, string> {
            {"Jwt__SecretKey", "SuperSecretKeyMustBe32BytesLongForSecurity!"},
            {"Jwt__Issuer", "Villa7API"},
            {"Jwt__Audience", "Villa7Frontend"}
        };

        IConfiguration configuration = new ConfigurationBuilder()
            .AddInMemoryCollection(inMemorySettings)
            .Build();

        var tokenService = new TokenService(configuration);
        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = "Admin User",
            Correo = "admin@villa7.com",
            Rol = "Administrador"
        };

        // Act
        var token = tokenService.GenerateAccessToken(usuario);

        // Assert
        token.Should().NotBeNullOrWhiteSpace();
        
        // Verify claims by decoding JwtSecurityToken
        var handler = new System.IdentityModel.Tokens.Jwt.JwtSecurityTokenHandler();
        var jwtToken = handler.ReadJwtToken(token);

        jwtToken.Subject.Should().Be(usuario.Id.ToString());
        jwtToken.Issuer.Should().Be("Villa7API");
        jwtToken.Audiences.Should().Contain("Villa7Frontend");
        
        var claims = jwtToken.Claims;
        claims.Should().Contain(c => c.Type == System.IdentityModel.Tokens.Jwt.JwtRegisteredClaimNames.Email && c.Value == usuario.Correo);
        claims.Should().Contain(c => (c.Type == ClaimTypes.Name || c.Type == "unique_name") && c.Value == usuario.Nombre);
        claims.Should().Contain(c => (c.Type == ClaimTypes.Role || c.Type == "role") && c.Value == usuario.Rol);
    }

    [Fact]
    public void GenerateRefreshToken_ShouldReturnRandomGuidString()
    {
        // Arrange
        var configurationMock = new Mock<IConfiguration>();
        var tokenService = new TokenService(configurationMock.Object);

        // Act
        var token1 = tokenService.GenerateRefreshToken();
        var token2 = tokenService.GenerateRefreshToken();

        // Assert
        token1.Should().NotBeNullOrWhiteSpace();
        token2.Should().NotBeNullOrWhiteSpace();
        token1.Should().NotBe(token2);
        Guid.TryParse(token1, out _).Should().BeTrue();
    }
}
