using System;

namespace Villa7.Domain.Entities;

public class AuditoriaEliminacion
{
    public Guid Id { get; set; }
    public DateTime Fecha { get; set; } = DateTime.UtcNow;
    public string Administrador { get; set; } = string.Empty;
    public string Entidad { get; set; } = string.Empty;
    public Guid EntidadId { get; set; }
    public string Nombre { get; set; } = string.Empty;
    public string? Ip { get; set; }
    public string? Motivo { get; set; }
}
