using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.Models.Dto;
using UserService.Models.Exceptions;
using UserService.Services;

namespace UserService.Controllers;

[ApiController]
[Route("[controller]")]
[AllowAnonymous]
public class AuthenticationController : ControllerBase
{
    private readonly IAuthenticationService _authenticationService;

    public AuthenticationController(IAuthenticationService authenticationService)
    {
        _authenticationService = authenticationService;
    }

    [HttpPost("register")]
    public async Task<ActionResult> Register([FromBody] RegisterDto registerDto)
    {
        try
        {
            await _authenticationService.Register(registerDto);
        }
        catch (Exception e)
        {
            if (e is EntityExistsException or NotMatchingException)
            {
                return BadRequest(e.Message);
            }

            return BadRequest(e.Message);
        }

        return Ok();
    }

    [HttpPost("login")]
    public async Task<ActionResult> Register([FromBody] LoginDto loginDto)
    {
        try
        {
            return Ok(await _authenticationService.Login(loginDto));
        }
        catch (Exception e)
        {
            if (e is EntityExistsException or NotMatchingException)
            {
                return BadRequest(e.Message);
            }

            return BadRequest(e.Message);
        }
    }
}