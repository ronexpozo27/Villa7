namespace Villa7.Domain.Entities;

public class Habitacion
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public int CapacidadMax { get; set; }
    public decimal PrecioPorNoche { get; set; }
    public bool Activa { get; set; } = true;
    public string? ImagenUrl { get; set; }
    public string? ImagenStoragePath { get; set; }
    public string? Ubicacion { get; set; }
    public DateTime? FechaCambioEstado { get; set; }
    public string? UsuarioCambioEstado { get; set; }
    public string? MotivoCambioEstado { get; set; }
}

