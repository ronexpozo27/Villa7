using Microsoft.EntityFrameworkCore;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Infrastructure.Persistence;

namespace Villa7.Infrastructure.Repositories;

public class ServicioRepository : IServicioRepository
{
    private readonly AppDbContext _context;

    public ServicioRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Servicio?> GetByIdAsync(Guid id)
    {
        return await _context.Servicios.FindAsync(id);
    }

    public async Task<Servicio?> GetByNombreAsync(string nombre)
    {
        return await _context.Servicios
            .FirstOrDefaultAsync(s => s.Nombre.ToLower() == nombre.ToLower().Trim());
    }

    public async Task<List<Servicio>> ListActiveAsync()
    {
        return await _context.Servicios
            .Where(s => s.Activo)
            .OrderBy(s => s.Nombre)
            .ToListAsync();
    }

    public async Task<List<Servicio>> ListAllAsync()
    {
        return await _context.Servicios
            .OrderBy(s => s.Nombre)
            .ToListAsync();
    }

    public async Task AddAsync(Servicio servicio)
    {
        await _context.Servicios.AddAsync(servicio);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Servicio servicio)
    {
        _context.Servicios.Update(servicio);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> NombreExistsAsync(string nombre, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
        {
            return await _context.Servicios
                .AnyAsync(s => s.Nombre.ToLower() == nombre.ToLower().Trim() && s.Id != excludeId.Value);
        }
        
        return await _context.Servicios
            .AnyAsync(s => s.Nombre.ToLower() == nombre.ToLower().Trim());
    }
}
