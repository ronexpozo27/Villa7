using Villa7.Domain.Entities;

namespace Villa7.Domain.Interfaces.Security;

public interface ITokenService
{
    string GenerateAccessToken(Usuario usuario);
    string GenerateRefreshToken();
}
