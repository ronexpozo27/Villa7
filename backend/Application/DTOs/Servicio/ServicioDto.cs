namespace Villa7.Application.DTOs.Servicio;

public class ServicioDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
    public bool Activo { get; set; }
    public DateTime? FechaCambioEstado { get; set; }
    public string? UsuarioCambioEstado { get; set; }
    public string? MotivoCambioEstado { get; set; }
}

