using Microsoft.EntityFrameworkCore;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Infrastructure.Persistence;

namespace Villa7.Infrastructure.Repositories;

public class HabitacionRepository : IHabitacionRepository
{
    private readonly AppDbContext _context;

    public HabitacionRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Habitacion?> GetByIdAsync(Guid id)
    {
        return await _context.Habitaciones.FindAsync(id);
    }

    public async Task<Habitacion?> GetByNombreAsync(string nombre)
    {
        return await _context.Habitaciones
            .FirstOrDefaultAsync(h => h.Nombre.ToLower() == nombre.ToLower().Trim());
    }

    public async Task<List<Habitacion>> ListActiveAsync()
    {
        return await _context.Habitaciones
            .Where(h => h.Activa)
            .OrderBy(h => h.Nombre)
            .ToListAsync();
    }

    public async Task<List<Habitacion>> ListAllAsync()
    {
        return await _context.Habitaciones
            .OrderBy(h => h.Nombre)
            .ToListAsync();
    }

    public async Task<List<Habitacion>> ListAvailableAsync(DateTime fechaEntrada, DateTime fechaSalida)
    {
        var activeRooms = await _context.Habitaciones.Where(h => h.Activa).ToListAsync();
        
        var reservedRoomIds = await _context.Reservas
            .Where(r => r.Estado == "Pendiente" || r.Estado == "Confirmada")
            .Where(r => r.FechaEntrada < fechaSalida && r.FechaSalida > fechaEntrada)
            .Select(r => r.HabitacionId)
            .Distinct()
            .ToListAsync();

        return activeRooms.Where(h => !reservedRoomIds.Contains(h.Id))
            .OrderBy(h => h.Nombre)
            .ToList();
    }

    public async Task AddAsync(Habitacion habitacion)
    {
        await _context.Habitaciones.AddAsync(habitacion);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Habitacion habitacion)
    {
        _context.Habitaciones.Update(habitacion);
        var entriesWritten = await _context.SaveChangesAsync();
        Console.WriteLine($"[IMAGE_UPLOAD_DEBUG] SaveChangesAsync returned: {entriesWritten} entries written.");
    }

    public async Task<bool> NombreExistsAsync(string nombre, Guid? excludeId = null)
    {
        if (excludeId.HasValue)
        {
            return await _context.Habitaciones
                .AnyAsync(h => h.Nombre.ToLower() == nombre.ToLower().Trim() && h.Id != excludeId.Value);
        }
        
        return await _context.Habitaciones
            .AnyAsync(h => h.Nombre.ToLower() == nombre.ToLower().Trim());
    }

    public async Task<bool> HasFutureBookingsAsync(Guid habitacionId)
    {
        var today = DateTime.UtcNow.Date;
        return await _context.Reservas
            .AnyAsync(r => r.HabitacionId == habitacionId &&
                           (r.Estado == "Pendiente" || r.Estado == "Confirmada") &&
                           r.FechaSalida >= today);
    }

    public async Task DeleteAsync(Habitacion habitacion)
    {
        _context.Habitaciones.Remove(habitacion);
        await _context.SaveChangesAsync();
    }

    public async Task<bool> HasAnyBookingsAsync(Guid habitacionId)
    {
        return await _context.Reservas.AnyAsync(r => r.HabitacionId == habitacionId);
    }
}
