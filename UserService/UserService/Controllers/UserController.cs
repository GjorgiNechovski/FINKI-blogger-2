using System.Threading.Tasks;
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
    public IActionResult GetUser()
    {
        var token = TokenExtractor.GetJwtTokenFromRequest(Request);
        var user = _jwtTokenService.GetUserFromToken(token);

        if (string.IsNullOrEmpty(user.UserName))
        {
            return Unauthorized();
        }

        return Ok(new 
        {
            user.UserName,
            user.Email,
            user.FirstName,
            user.LastName
        });
    }
}