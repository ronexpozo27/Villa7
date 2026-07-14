using Villa7.Domain.Entities;

namespace Villa7.Domain.Interfaces.Repositories;

public interface IServicioRepository
{
    Task<Servicio?> GetByIdAsync(Guid id);
    Task<Servicio?> GetByNombreAsync(string nombre);
    Task<List<Servicio>> ListActiveAsync();
    Task<List<Servicio>> ListAllAsync();
    Task AddAsync(Servicio servicio);
    Task UpdateAsync(Servicio servicio);
    Task<bool> NombreExistsAsync(string nombre, Guid? excludeId = null);
    Task<bool> HasBookingsAsync(Guid servicioId);
}

