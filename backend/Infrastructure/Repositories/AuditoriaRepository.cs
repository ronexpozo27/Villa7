using System.Threading.Tasks;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Infrastructure.Persistence;

namespace Villa7.Infrastructure.Repositories;

public class AuditoriaRepository : IAuditoriaRepository
{
    private readonly AppDbContext _context;

    public AuditoriaRepository(AppDbContext context)
    {
        _context = context;
    }

    public async Task RegistrarEliminacionAsync(AuditoriaEliminacion auditoria)
    {
        await _context.AuditoriaEliminaciones.AddAsync(auditoria);
        await _context.SaveChangesAsync();
    }
}
