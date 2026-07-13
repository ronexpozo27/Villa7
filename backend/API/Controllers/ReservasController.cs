using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Villa7.Application.DTOs.Reserva;
using Villa7.Application.Interfaces;

namespace Villa7.API.Controllers;

[ApiController]
[Route("api/v1/reservas")]
[Authorize] // Toda ruta en este controlador requiere autenticación por defecto
public class ReservasController : ControllerBase
{
    private readonly IReservaService _reservaService;

    public ReservasController(IReservaService reservaService)
    {
        _reservaService = reservaService;
    }

    [HttpPost]
    public async Task<IActionResult> Create([FromBody] CrearReservaDto dto)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var usuarioId))
            {
                return Unauthorized(new { status = 401, message = "Identificación de usuario inválida en el token." });
            }

            var response = await _reservaService.CreateAsync(usuarioId, dto);
            return StatusCode(201, response); // 201 Created como indica APIDesign.md
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            // Retorna 409 Conflict si hay problemas de concurrencia/disponibilidad
            return Conflict(new { status = 409, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error inesperado al procesar tu reserva.", details = ex.Message });
        }
    }

    [HttpGet("mis-reservas")]
    [Authorize(Roles = "Cliente")]
    public async Task<IActionResult> GetMyBookings()
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var usuarioId))
            {
                return Unauthorized(new { status = 401, message = "Identificación de usuario inválida." });
            }

            var response = await _reservaService.ListByUsuarioIdAsync(usuarioId);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al obtener tu historial de reservas.", details = ex.Message });
        }
    }

    [HttpGet]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> GetAll([FromQuery] string? estado)
    {
        try
        {
            var response = await _reservaService.ListAllAsync(estado);
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al consultar las reservas.", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var response = await _reservaService.GetByIdAsync(id);
            if (response == null)
            {
                return NotFound(new { status = 404, message = "La reserva solicitada no existe." });
            }

            // Regla de Autorización: Solo el propietario o el administrador pueden ver los detalles
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            var userRole = User.FindFirst(ClaimTypes.Role)?.Value ?? User.FindFirst("role")?.Value;

            if (userRole != "Administrador" && response.UsuarioId.ToString() != userIdStr)
            {
                return Forbid();
            }

            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al consultar los detalles de la reserva.", details = ex.Message });
        }
    }

    [HttpPatch("{id}/estado")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ChangeStatus(Guid id, [FromBody] CambiarEstadoReservaDto dto)
    {
        try
        {
            await _reservaService.ChangeStatusAsync(id, dto.NuevoEstado);
            return NoContent(); // 204 No Content
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message });
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { status = 404, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message }); // Transición inválida
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al actualizar el estado de la reserva.", details = ex.Message });
        }
    }

    [HttpPatch("{id}/cancelar")]
    public async Task<IActionResult> Cancel(Guid id)
    {
        try
        {
            var userIdStr = User.FindFirst(ClaimTypes.NameIdentifier)?.Value ?? User.FindFirst("sub")?.Value;
            if (string.IsNullOrEmpty(userIdStr) || !Guid.TryParse(userIdStr, out var usuarioId))
            {
                return Unauthorized(new { status = 401, message = "Identificación de usuario inválida." });
            }

            await _reservaService.CancelByClientAsync(id, usuarioId);
            return NoContent();
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { status = 404, message = ex.Message });
        }
        catch (UnauthorizedAccessException)
        {
            return Forbid();
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al cancelar tu reserva.", details = ex.Message });
        }
    }
}
