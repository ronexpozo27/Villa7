using Villa7.Application.DTOs.Cliente;
using Villa7.Application.Interfaces;
using Villa7.Domain.Interfaces.Repositories;

namespace Villa7.Application.Services;

public class ClienteService : IClienteService
{
    private readonly IUsuarioRepository _usuarioRepository;

    public ClienteService(IUsuarioRepository usuarioRepository)
    {
        _usuarioRepository = usuarioRepository;
    }

    public async Task<List<ClienteDto>> ListClientesAsync()
    {
        var clientes = await _usuarioRepository.ListClientesAsync();
        return clientes.Select(c => new ClienteDto
        {
            Id = c.Id,
            Nombre = c.Nombre,
            Correo = c.Correo,
            FechaCreacion = c.FechaCreacion
        }).ToList();
    }

    public async Task<ClienteDto?> GetByIdAsync(Guid id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null || usuario.Rol != "Cliente")
        {
            return null;
        }

        return new ClienteDto
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Correo = usuario.Correo,
            FechaCreacion = usuario.FechaCreacion
        };
    }
}
