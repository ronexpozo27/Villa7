using Villa7.Domain.Entities;

namespace Villa7.Domain.Interfaces.Repositories;

public interface IHabitacionRepository
{
    Task<Habitacion?> GetByIdAsync(Guid id);
    Task<Habitacion?> GetByNombreAsync(string nombre);
    Task<List<Habitacion>> ListActiveAsync();
    Task<List<Habitacion>> ListAllAsync();
    Task<List<Habitacion>> ListAvailableAsync(DateTime fechaEntrada, DateTime fechaSalida);
    Task AddAsync(Habitacion habitacion);
    Task UpdateAsync(Habitacion habitacion);
    Task<bool> NombreExistsAsync(string nombre, Guid? excludeId = null);
    Task<bool> HasFutureBookingsAsync(Guid habitacionId);
}
