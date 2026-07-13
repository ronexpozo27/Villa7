using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Infrastructure.Persistence;

namespace Villa7.Infrastructure.Repositories;

public class ReservaRepository : IReservaRepository
{
    private readonly AppDbContext _context;

    public ReservaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task<Reserva?> GetByIdAsync(Guid id)
    {
        return await _context.Reservas.FindAsync(id);
    }

    public async Task<Reserva?> GetByIdWithDetailsAsync(Guid id)
    {
        return await _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Habitacion)
            .Include(r => r.ReservaServicios)
                .ThenInclude(rs => rs.Servicio)
            .FirstOrDefaultAsync(r => r.Id == id);
    }

    public async Task<List<Reserva>> ListByUsuarioIdAsync(Guid usuarioId)
    {
        return await _context.Reservas
            .Include(r => r.Habitacion)
            .Include(r => r.ReservaServicios)
                .ThenInclude(rs => rs.Servicio)
            .Where(r => r.UsuarioId == usuarioId)
            .OrderByDescending(r => r.FechaCreacion)
            .ToListAsync();
    }

    public async Task<List<Reserva>> ListAllAsync(string? estado = null)
    {
        var query = _context.Reservas
            .Include(r => r.Usuario)
            .Include(r => r.Habitacion)
            .Include(r => r.ReservaServicios)
                .ThenInclude(rs => rs.Servicio)
            .AsQueryable();

        if (!string.IsNullOrWhiteSpace(estado))
        {
            query = query.Where(r => r.Estado.ToLower() == estado.ToLower().Trim());
        }

        return await query.OrderByDescending(r => r.FechaCreacion).ToListAsync();
    }

    public async Task<bool> IsRoomAvailableAsync(Guid habitacionId, DateTime entrada, DateTime salida)
    {
        var hasOverlap = await _context.Reservas
            .AnyAsync(r => r.HabitacionId == habitacionId &&
                           (r.Estado == "Pendiente" || r.Estado == "Confirmada") &&
                           r.FechaEntrada < salida && r.FechaSalida > entrada);

        return !hasOverlap;
    }

    public async Task AddAsync(Reserva reserva)
    {
        await _context.Reservas.AddAsync(reserva);
        await _context.SaveChangesAsync();
    }

    public async Task UpdateAsync(Reserva reserva)
    {
        _context.Reservas.Update(reserva);
        await _context.SaveChangesAsync();
    }

    public async Task<IDbTransaction> BeginTransactionAsync()
    {
        var tx = await _context.Database.BeginTransactionAsync();
        return new EfDbTransaction(tx);
    }

    private class EfDbTransaction : IDbTransaction
    {
        private readonly IDbContextTransaction _transaction;

        public EfDbTransaction(IDbContextTransaction transaction)
        {
            _transaction = transaction;
        }

        public async Task CommitAsync()
        {
            await _transaction.CommitAsync();
        }

        public async Task RollbackAsync()
        {
            await _transaction.RollbackAsync();
        }

        public async ValueTask DisposeAsync()
        {
            await _transaction.DisposeAsync();
        }
    }
}
