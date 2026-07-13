namespace Villa7.Domain.Interfaces.Repositories;

public interface IDbTransaction : IAsyncDisposable
{
    Task CommitAsync();
    Task RollbackAsync();
}
