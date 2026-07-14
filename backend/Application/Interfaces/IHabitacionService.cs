using Villa7.Application.DTOs.Habitacion;

namespace Villa7.Application.Interfaces;

public interface IHabitacionService
{
    Task<List<HabitacionDto>> ListActiveAsync(DateTime? fechaEntrada, DateTime? fechaSalida);
    Task<List<HabitacionDto>> ListAllAsync();
    Task<HabitacionDto?> GetByIdAsync(Guid id);
    Task<HabitacionDto> CreateAsync(CrearHabitacionDto dto);
    Task UpdateAsync(Guid id, EditarHabitacionDto dto);
    Task ToggleStatusAsync(Guid id, bool activa);
    Task<string> CambiarEstadoAsync(Guid id, bool activa, string? motivo, string adminEmail);
}

