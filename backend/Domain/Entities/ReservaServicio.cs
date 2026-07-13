namespace Villa7.Domain.Entities;

public class ReservaServicio
{
    public Guid ReservaId { get; set; }
    public Reserva Reserva { get; set; } = null!;
    public Guid ServicioId { get; set; }
    public Servicio Servicio { get; set; } = null!;
    public decimal PrecioContratado { get; set; }
}
