using Microsoft.EntityFrameworkCore;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Infrastructure.Persistence;

namespace Villa7.Infrastructure.Repositories;

public class UsuarioRepository : IUsuarioRepository
{
    private readonly AppDbContext _context;

    public UsuarioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Usuario?> GetByIdAsync(Guid id)
    {
        return await _context.Usuarios.FindAsync(id);
    }

    public async Task<Usuario?> GetByCorreoAsync(string correo)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Correo.ToLower() == correo.ToLower().Trim());
    }

    public async Task<Usuario?> GetByRefreshTokenAsync(string refreshToken)
    {
        return await _context.Usuarios
            .FirstOrDefaultAsync(u => u.RefreshToken == refreshToken);
    }

    public async Task AddAsync(Usuario usuario)
    {
        await _context.Usuarios.AddAsync(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Usuario usuario)
    {
        _context.Usuarios.Update(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> CorreoExistsAsync(string correo)
    {
        return await _context.Usuarios
            .AnyAsync(u => u.Correo.ToLower() == correo.ToLower().Trim());
    }

    public async Task<List<Usuario>> ListClientesAsync()
    {
        return await _context.Usuarios
            .Where(u => u.Rol == "Cliente")
            .OrderBy(u => u.Nombre)
            .ToListAsync();
    }

    public async Task DeleteAsync(Usuario usuario)
    {
        _context.Usuarios.Remove(usuario);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasAnyBookingsAsync(Guid usuarioId)
    {
        return await _context.Reservas.AnyAsync(r => r.UsuarioId == usuarioId);
    }
}
