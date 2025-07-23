using System;
using System.Collections.Generic;
using System.IdentityModel.Tokens.Jwt;
using System.Linq;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using UserService.Models;

namespace UserService.Services.Implementation;

public class JwtTokenService : IJwtTokenService
{
    private readonly IConfiguration _configuration;

    public JwtTokenService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public string GenerateToken(User user)
    {
        var securityKey = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_configuration["Authentication:SecretForKey"] ?? throw new InvalidOperationException("SecretForKey is not configured")));
        var signingCredentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

        var claims = new List<Claim>
        {
            new(ClaimTypes.Email, user.Email ?? string.Empty),
            new(ClaimTypes.GivenName, user.FirstName ?? string.Empty),
            new(ClaimTypes.Surname, user.LastName ?? string.Empty),
            new(ClaimTypes.NameIdentifier, user.UserName) // Changed from Id to UserName
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Issuer = _configuration["Authentication:Issuer"],
            Audience = _configuration["Authentication:Audience"],
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.UtcNow.AddHours(1),
            SigningCredentials = signingCredentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateJwtSecurityToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);
    }

    public User GetUserFromToken(string token)
    {
        var user = new User();
        var decodedToken = Decode(token);
        var claims = decodedToken.Claims.Select(claim => (claim.Type, claim.Value)).ToList();

        foreach (var claim in claims) 
        {
            switch (claim.Type)
            {
                case "email":
                    user.Email = claim.Value;
                    break;
                case "given_name":
                    user.FirstName = claim.Value;
                    break;
                case "family_name":
                    user.LastName = claim.Value;
                    break; 
                case "nameid":
                    user.UserName = claim.Value;
                    break;
            }
        }

        return user;
    }
    
    private JwtSecurityToken Decode(string token)
    {
        var tokenHandler = new JwtSecurityTokenHandler();
        return tokenHandler.ReadJwtToken(token);
    }
}