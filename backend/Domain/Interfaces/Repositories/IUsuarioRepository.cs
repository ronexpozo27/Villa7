using Villa7.Domain.Entities;

namespace Villa7.Domain.Interfaces.Repositories;

public interface IUsuarioRepository
{
    Task<Usuario?> GetByIdAsync(Guid id);
    Task<Usuario?> GetByCorreoAsync(string correo);
    Task<Usuario?> GetByRefreshTokenAsync(string refreshToken);
    Task AddAsync(Usuario usuario);
    Task UpdateAsync(Usuario usuario);
    Task<bool> CorreoExistsAsync(string correo);
    Task<List<Usuario>> ListClientesAsync();
}
