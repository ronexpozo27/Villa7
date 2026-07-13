using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Security;

namespace Villa7.Infrastructure.Security;

public class TokenService : ITokenService
{
    private readonly IConfiguration _configuration;

    public TokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateAccessToken(Usuario usuario)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        
        var secretKey = _configuration["Jwt__SecretKey"] 
            ?? _configuration["Jwt:SecretKey"] 
            ?? throw new InvalidOperationException("JWT Secret Key is not configured.");
            
        var issuer = _configuration["Jwt__Issuer"] ?? _configuration["Jwt:Issuer"] ?? "Villa7API";
        var audience = _configuration["Jwt__Audience"] ?? _configuration["Jwt:Audience"] ?? "Villa7Frontend";

        var key = Encoding.UTF8.GetBytes(secretKey);

        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, usuario.Id.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, usuario.Correo),
            new Claim(ClaimTypes.Name, usuario.Nombre),
            new Claim(ClaimTypes.Role, usuario.Rol)
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddMinutes(60), // JWT valid for 60 minutes as per RN-006
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
        };

        var token = tokenHandler.CreateToken(tokenDescriptor);
        return tokenHandler.WriteToken(token);
    }

    public string GenerateRefreshToken()
    {
        // Genera un token UUIDv4 aleatorio de alta entropía como se define en SecurityDesign.md
        return Guid.NewGuid().ToString();
    }
}
