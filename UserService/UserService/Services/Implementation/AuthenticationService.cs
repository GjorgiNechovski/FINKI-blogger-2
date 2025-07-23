using System;
using System.Linq;
using System.Threading.Tasks;
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
        var userByEmail = await _userManager.FindByEmailAsync(registerDto.Email);
        if (userByEmail != null)
        {
            throw new EntityExistsException("Email already exists");
        }

        var userByName = await _userManager.FindByNameAsync(registerDto.UserName);
        if (userByName != null)
        {
            throw new EntityExistsException("Username already exists");
        }

        if (registerDto.Password != registerDto.ConfirmPassword)
        {
            throw new NotMatchingException("Passwords do not match");
        }

        var user = new User
        {
            FirstName = registerDto.FirstName,
            LastName = registerDto.LastName,
            Email = registerDto.Email,
            UserName = registerDto.UserName, 
            NormalizedUserName = registerDto.UserName.ToUpper()
        };
        
        var result = await _userManager.CreateAsync(user, registerDto.Password);
        if (!result.Succeeded)
        {
            throw new NotMatchingException(string.Join("; ", result.Errors.Select(e => e.Description)));
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