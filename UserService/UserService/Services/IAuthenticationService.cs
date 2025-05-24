using UserService.Models.Dto;

namespace UserService.Services;

public interface IAuthenticationService
{
    Task Register(RegisterDto registerDto);
    Task<string> Login(LoginDto loginDto);
}