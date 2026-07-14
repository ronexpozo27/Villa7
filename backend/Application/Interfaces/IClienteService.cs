using Villa7.Application.DTOs.Cliente;

namespace Villa7.Application.Interfaces;

public interface IClienteService
{
    Task<List<ClienteDto>> ListClientesAsync();
    Task<ClienteDto?> GetByIdAsync(Guid id);
    Task<bool> CambiarEstadoAsync(Guid id, bool activo, string? motivo, string adminEmail);
    Task DeleteAsync(Guid id, string adminEmail, string? ip, string? motivo);
}

