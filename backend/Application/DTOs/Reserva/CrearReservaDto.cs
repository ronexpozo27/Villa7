namespace Villa7.Application.DTOs.Reserva;

public class CrearReservaDto
{
    public Guid HabitacionId { get; set; }
    public DateTime FechaEntrada { get; set; }
    public DateTime FechaSalida { get; set; }
    public List<Guid> ServiciosIds { get; set; } = new();
}
