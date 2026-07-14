namespace Villa7.Domain.Entities;

public class Reserva
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public Usuario Usuario { get; set; } = null!;
    public Guid HabitacionId { get; set; }
    public Habitacion Habitacion { get; set; } = null!;
    public DateTime FechaEntrada { get; set; }
    public DateTime FechaSalida { get; set; }
    public string Estado { get; set; } = string.Empty;
    public decimal TotalCalculado { get; set; }
    public DateTime FechaCreacion { get; set; } = DateTime.UtcNow;
    public DateTime? FechaCancelacion { get; set; }
    public DateTime? FechaCambioEstado { get; set; }
    public string? UsuarioCambioEstado { get; set; }
    public string? MotivoCambioEstado { get; set; }
    
    public ICollection<ReservaServicio> ReservaServicios { get; set; } = new List<ReservaServicio>();
}

