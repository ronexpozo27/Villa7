using Villa7.Application.DTOs.Auth;
using Villa7.Application.Interfaces;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Domain.Interfaces.Security;

namespace Villa7.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly ITokenService _tokenService;
    private readonly IPasswordHasher _passwordHasher;

    public System.Text.RegularExpressions.Regex emailRegex = new(
        @"^[^@\s]+@[^@\s]+\.[^@\s]+$",
        System.Text.RegularExpressions.RegexOptions.Compiled | System.Text.RegularExpressions.RegexOptions.IgnoreCase);

    public AuthService(
        IUsuarioRepository usuarioRepository,
        ITokenService tokenService,
        IPasswordHasher passwordHasher)
    {
        _usuarioRepository = usuarioRepository;
        _tokenService = tokenService;
        _passwordHasher = passwordHasher;
    }

    public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
    {
        // 1. Validar campos obligatorios
        if (string.IsNullOrWhiteSpace(dto.Nombre) || string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Password))
        {
            throw new ArgumentException("Todos los campos (nombre, correo, contraseña) son obligatorios.");
        }

        // 2. Validar formato de correo
        if (!emailRegex.IsMatch(dto.Correo))
        {
            throw new ArgumentException("El correo electrónico no posee un formato válido.");
        }

        // 3. Validar longitud/complejidad de contraseña (mínimo 8 caracteres)
        if (dto.Password.Length < 8)
        {
            throw new ArgumentException("La contraseña debe tener al menos 8 caracteres.");
        }

        // 4. Validar unicidad del correo (RN-001)
        if (await _usuarioRepository.CorreoExistsAsync(dto.Correo))
        {
            throw new InvalidOperationException("El correo electrónico ya está registrado en el sistema.");
        }

        // 5. Cifrar contraseña (RN-003, RN-004)
        var passwordHash = _passwordHasher.Hash(dto.Password);

        // 6. Instanciar usuario con rol Cliente (RN-010)
        var usuario = new Usuario
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre.Trim(),
            Correo = dto.Correo.ToLower().Trim(),
            PasswordHash = passwordHash,
            Rol = "Cliente",
            FechaCreacion = DateTime.UtcNow
        };

        // Guardar usuario inicial
        await _usuarioRepository.AddAsync(usuario);

        // 7. Generar tokens (RN-005, RN-006, RN-007)
        var accessToken = _tokenService.GenerateAccessToken(usuario);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // 8. Guardar Refresh Token en BD
        usuario.RefreshToken = refreshToken;
        usuario.RefreshTokenExpiracion = DateTime.UtcNow.AddDays(7); // 7 días (RN-007)
        await _usuarioRepository.UpdateAsync(usuario);

        return MapToAuthResponse(usuario, accessToken, refreshToken);
    }

    public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.Correo) || string.IsNullOrWhiteSpace(dto.Password))
        {
            throw new ArgumentException("El correo y la contraseña son obligatorios.");
        }

        // 1. Obtener usuario
        var usuario = await _usuarioRepository.GetByCorreoAsync(dto.Correo);
        if (usuario == null)
        {
            // Mensaje genérico para evitar divulgación de existencia de cuentas (RN-005)
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        if (!usuario.Activo)
        {
            throw new UnauthorizedAccessException("Su cuenta se encuentra inactiva. Comuníquese con el administrador.");
        }

        // 2. Verificar hash de contraseña
        var isValid = _passwordHasher.Verify(dto.Password, usuario.PasswordHash);
        if (!isValid)
        {
            throw new UnauthorizedAccessException("Credenciales inválidas.");
        }

        // 3. Generar nuevos tokens
        var accessToken = _tokenService.GenerateAccessToken(usuario);
        var refreshToken = _tokenService.GenerateRefreshToken();

        // 4. Guardar Refresh Token
        usuario.RefreshToken = refreshToken;
        usuario.RefreshTokenExpiracion = DateTime.UtcNow.AddDays(7);
        await _usuarioRepository.UpdateAsync(usuario);

        return MapToAuthResponse(usuario, accessToken, refreshToken);
    }

    public async Task<AuthResponseDto> RefreshAsync(RefreshTokenDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken))
        {
            throw new ArgumentException("El Refresh Token es obligatorio.");
        }

        // 1. Obtener usuario por refresh token
        var usuario = await _usuarioRepository.GetByRefreshTokenAsync(dto.RefreshToken);
        if (usuario == null || !usuario.Activo || usuario.RefreshTokenExpiracion < DateTime.UtcNow)
        {
            throw new UnauthorizedAccessException("Sesión expirada o Refresh Token inválido.");
        }

        // 2. Generar nuevos tokens (Refresh Token simple de renovación)
        var accessToken = _tokenService.GenerateAccessToken(usuario);
        var newRefreshToken = _tokenService.GenerateRefreshToken();

        // 3. Actualizar en BD
        usuario.RefreshToken = newRefreshToken;
        usuario.RefreshTokenExpiracion = DateTime.UtcNow.AddDays(7);
        await _usuarioRepository.UpdateAsync(usuario);

        return MapToAuthResponse(usuario, accessToken, newRefreshToken);
    }

    private static AuthResponseDto MapToAuthResponse(Usuario usuario, string accessToken, string refreshToken)
    {
        return new AuthResponseDto
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            Usuario = new UsuarioInfoDto
            {
                Id = usuario.Id,
                Nombre = usuario.Nombre,
                Correo = usuario.Correo,
                Rol = usuario.Rol
            }
        };
    }
}
