using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Villa7.Application.Interfaces;

namespace Villa7.API.Controllers;

[ApiController]
[Route("api/v1/clientes")]
[Authorize(Roles = "Administrador")]
public class ClientesController : ControllerBase
{
    private readonly IClienteService _clienteService;

    public ClientesController(IClienteService clienteService)
    {
        _clienteService = clienteService;
    }

    [HttpGet]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var response = await _clienteService.ListClientesAsync();
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al obtener el listado de clientes.", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var response = await _clienteService.GetByIdAsync(id);
            if (response == null)
            {
                return NotFound(new { status = 404, message = "El cliente solicitado no existe." });
            }
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al obtener los datos del cliente.", details = ex.Message });
        }
     }

    [HttpPatch("{id}/estado")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] System.Text.Json.JsonElement payload)
    {
        try
        {
            var adminEmail = User.FindFirst(System.Security.Claims.ClaimTypes.Email)?.Value 
                             ?? User.FindFirst("email")?.Value 
                             ?? "admin@villa7.com";

            bool activo = true;
            string? motivo = null;

            if (payload.ValueKind == System.Text.Json.JsonValueKind.True || payload.ValueKind == System.Text.Json.JsonValueKind.False)
            {
                activo = payload.GetBoolean();
                await _clienteService.CambiarEstadoAsync(id, activo, motivo, adminEmail);
                return NoContent();
            }
            else
            {
                var dto = System.Text.Json.JsonSerializer.Deserialize<Villa7.Application.DTOs.Common.CambiarEstadoDto>(payload.GetRawText(), new System.Text.Json.JsonSerializerOptions { PropertyNameCaseInsensitive = true });
                if (dto != null)
                {
                    activo = dto.Activo;
                    motivo = dto.Motivo;
                }
                await _clienteService.CambiarEstadoAsync(id, activo, motivo, adminEmail);
                return Ok(new { 
                    success = true, 
                    action = activo ? "activated" : "deactivated", 
                    message = activo ? "El cliente fue activado correctamente." : "El cliente fue desactivado correctamente." 
                });
            }
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { status = 404, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al cambiar el estado del cliente.", details = ex.Message });
        }
    }
}

