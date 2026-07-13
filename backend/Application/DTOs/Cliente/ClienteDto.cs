namespace Villa7.Application.DTOs.Cliente;

public class ClienteDto
{
    public Guid Id { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string Correo { get; set; } = string.Empty;
    public DateTime FechaCreacion { get; set; }
}
