using System.IdentityModel.Tokens.Jwt;
using UserService.Models;

namespace UserService.Services;

public interface IJwtTokenService
{
    string GenerateToken(User user);
    User GetUserFromToken(string token);
}