using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using UserService.Models;
using UserService.Models.Dto;
using UserService.Models.Exceptions;

namespace UserService.Services.Implementation;

public class AuthenticationService : IAuthenticationService
{
    private readonly UserManager<User> _userManager;
    private readonly IJwtTokenService _jwtTokenService;

    public AuthenticationService(UserManager<User> userManager, IJwtTokenService jwtTokenService)
    {
        _userManager = userManager;
        _jwtTokenService = jwtTokenService;
    }

    public async Task Register(RegisterDto registerDto)
    {
        var user = await _userManager.FindByEmailAsync(registerDto.Email);

        if (user != null)
        {
            throw new EntityExistsException("Email already exists");
        }

        if (registerDto.Password != registerDto.ConfirmPassword)
        {
            throw new NotMatchingException("Passwords do not match");
        }

        user = new User
        {
            Id = Guid.NewGuid().ToString(),
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = registerDto.Email,
            UserName = registerDto.Email,
        };
        
        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            throw new NotMatchingException(result.Errors.ToString());
        }
    }

    public async Task<string> Login(LoginDto loginDto)
    {
        var user = await _userManager.FindByEmailAsync(loginDto.Email);

        if (user == null)
        {
            throw new EntityNotExistsException("Please enter correct credentials");
        }

        if (!await _userManager.CheckPasswordAsync(user, loginDto.Password))
        {
            throw new NotMatchingException("Invalid credentials");
        }

        return _jwtTokenService.GenerateToken(user);
    }
}