namespace Villa7.Application.DTOs.Reserva;

public class ReservaDto
{
    public Guid Id { get; set; }
    public Guid UsuarioId { get; set; }
    public string UsuarioNombre { get; set; } = string.Empty;
    public Guid HabitacionId { get; set; }
    public string HabitacionNombre { get; set; } = string.Empty;
    public DateTime FechaEntrada { get; set; }
    public DateTime FechaSalida { get; set; }
    public string Estado { get; set; } = string.Empty;
    public decimal TotalCalculado { get; set; }
    public DateTime FechaCreacion { get; set; }
    public DateTime? FechaCancelacion { get; set; }
    public DateTime? FechaCambioEstado { get; set; }
    public string? UsuarioCambioEstado { get; set; }
    public string? MotivoCambioEstado { get; set; }
    
    public List<ReservaServicioDto> ServiciosContratados { get; set; } = new();
}


public class ReservaServicioDto
{
    public Guid ServicioId { get; set; }
    public string ServicioNombre { get; set; } = string.Empty;
    public decimal PrecioContratado { get; set; }
}
