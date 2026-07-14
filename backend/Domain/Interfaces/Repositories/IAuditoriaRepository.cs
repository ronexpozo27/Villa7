using System.Threading.Tasks;
using Villa7.Domain.Entities;

namespace Villa7.Domain.Interfaces.Repositories;

public interface IAuditoriaRepository
{
    Task RegistrarEliminacionAsync(AuditoriaEliminacion auditoria);
}
