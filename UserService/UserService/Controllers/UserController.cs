using Microsoft.AspNetCore.Mvc;
using UserService.Services;
using UserService.Util;

namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
public class UserController : ControllerBase
{
    private readonly IJwtTokenService _jwtTokenService;

    public UserController(IJwtTokenService jwtTokenService)
    {
        _jwtTokenService = jwtTokenService;
    }

    [HttpGet]
    public async Task<IActionResult> GetUser()
    {
        var token = TokenExtractor.GetJwtTokenFromRequest(Request);
        var user = _jwtTokenService.GetUserFromToken(token);

        if (user.Id == null)
        {
            return Unauthorized();
        }

        return Ok(new 
        {
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
        });

    }
}