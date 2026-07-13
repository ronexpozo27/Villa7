namespace Villa7.Application.DTOs.Servicio;

public class CrearServicioDto
{
    public string Nombre { get; set; } = string.Empty;
    public string Descripcion { get; set; } = string.Empty;
    public decimal Precio { get; set; }
}
