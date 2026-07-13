using Villa7.Domain.Entities;

namespace Villa7.Domain.Interfaces.Repositories;

public interface IReservaRepository
{
    Task<Reserva?> GetByIdAsync(Guid id);
    Task<Reserva?> GetByIdWithDetailsAsync(Guid id);
    Task<List<Reserva>> ListByUsuarioIdAsync(Guid usuarioId);
    Task<List<Reserva>> ListAllAsync(string? estado = null);
    Task<bool> IsRoomAvailableAsync(Guid habitacionId, DateTime entrada, DateTime salida);
    Task AddAsync(Reserva reserva);
    Task UpdateAsync(Reserva reserva);
    
    // Return the pure Domain IDbTransaction abstraction
    Task<IDbTransaction> BeginTransactionAsync();
}
