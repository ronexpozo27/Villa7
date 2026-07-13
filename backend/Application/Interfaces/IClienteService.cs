using Villa7.Application.DTOs.Cliente;

namespace Villa7.Application.Interfaces;

public interface IClienteService
{
    Task<List<ClienteDto>> ListClientesAsync();
    Task<ClienteDto?> GetByIdAsync(Guid id);
}
