using BCrypt.Net;
using Villa7.Domain.Interfaces.Security;

namespace Villa7.Infrastructure.Security;

public class PasswordHasher : IPasswordHasher
{
    public string Hash(string password)
    {
        // Genera el hash irreversible usando BCrypt con factor de costo 12 (especificado en SecurityDesign.md)
        return BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
    }

    public bool Verify(string password, string passwordHash)
    {
        return BCrypt.Net.BCrypt.Verify(password, passwordHash);
    }
}
