using Villa7.Application.DTOs.Reserva;

namespace Villa7.Application.Interfaces;

public interface IReservaService
{
    Task<ReservaDto> CreateAsync(Guid usuarioId, CrearReservaDto dto);
    Task<List<ReservaDto>> ListByUsuarioIdAsync(Guid usuarioId);
    Task<List<ReservaDto>> ListAllAsync(string? estado);
    Task<ReservaDto?> GetByIdAsync(Guid id);
    Task CancelByClientAsync(Guid id, Guid usuarioId);
    Task ChangeStatusAsync(Guid id, string nuevoEstado);
    Task CancelWithMotivoAsync(Guid id, Guid usuarioId, string? motivo, string executorEmail);
    Task AnularAsync(Guid id, string motivo, string executorEmail);
}

