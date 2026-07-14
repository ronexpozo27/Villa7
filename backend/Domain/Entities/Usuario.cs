namespace Villa7.Domain.Entities;

public class Usuario
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public string PasswordHash { get; set; } = string.Empty;
    public string Rol { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public string? RefreshToken { get; set; }
    public DateTime? RefreshTokenExpiracion { get; set; }
    public bool Activo { get; set; } = true;
    public DateTime? FechaCambioEstado { get; set; }
    public string? UsuarioCambioEstado { get; set; }
    public string? MotivoCambioEstado { get; set; }
}

