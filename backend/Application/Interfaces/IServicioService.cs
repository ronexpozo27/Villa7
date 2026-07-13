using Villa7.Application.DTOs.Servicio;

namespace Villa7.Application.Interfaces;

public interface IServicioService
{
    Task<List<ServicioDto>> ListActiveAsync();
    Task<List<ServicioDto>> ListAllAsync();
    Task<ServicioDto?> GetByIdAsync(Guid id);
    Task<ServicioDto> CreateAsync(CrearServicioDto dto);
    Task UpdateAsync(Guid id, EditarServicioDto dto);
    Task ToggleStatusAsync(Guid id, bool activo);
}
