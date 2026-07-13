using Microsoft.AspNetCore.Mvc;
using Villa7.Application.DTOs.Auth;
using Villa7.Application.Interfaces;

namespace Villa7.API.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] RegisterDto dto)
    {
        try
        {
            var response = await _authService.RegisterAsync(dto);
            return StatusCode(201, response); // 201 Created — RF-021, APIDesign.md POST /api/v1/auth/register
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = 400, title = "One or more validation errors occurred.", errors = new Dictionary<string, string[]> { { "Validation", new[] { ex.Message } } } });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { status = 409, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error inesperado al procesar tu registro.", details = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] LoginDto dto)
    {
        try
        {
            var response = await _authService.LoginAsync(dto);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { status = 401, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error inesperado al iniciar sesión.", details = ex.Message });
        }
    }

    [HttpPost("refresh")]
    public async Task<IActionResult> Refresh([FromBody] RefreshTokenDto dto)
    {
        try
        {
            var response = await _authService.RefreshAsync(dto);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message });
        }
        catch (UnauthorizedAccessException ex)
        {
            return Unauthorized(new { status = 401, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error inesperado al renovar el token.", details = ex.Message });
        }
    }
}
