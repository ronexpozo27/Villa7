using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Villa7.Application.DTOs.Servicio;
using Villa7.Application.Interfaces;

namespace Villa7.API.Controllers;

[ApiController]
[Route("api/v1/servicios")]
public class ServiciosController : ControllerBase
{
    private readonly IServicioService _servicioService;

    public ServiciosController(IServicioService servicioService)
    {
        _servicioService = servicioService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive()
    {
        try
        {
            var response = await _servicioService.ListActiveAsync();
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al consultar los servicios.", details = ex.Message });
        }
    }

    [HttpGet("admin-list")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var response = await _servicioService.ListAllAsync();
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al obtener el listado completo de servicios.", details = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Create([FromBody] CrearServicioDto dto)
    {
        try
        {
            var response = await _servicioService.CreateAsync(dto);
            return StatusCode(201, response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            return Conflict(new { status = 409, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al registrar el servicio.", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(Guid id, [FromBody] EditarServicioDto dto)
    {
        try
        {
            await _servicioService.UpdateAsync(id, dto);
            return NoContent();
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
            return Conflict(new { status = 409, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al actualizar el servicio.", details = ex.Message });
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
                await _servicioService.ToggleStatusAsync(id, activo);
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
                var message = await _servicioService.CambiarEstadoAsync(id, activo, motivo, adminEmail);
                return Ok(new { 
                    success = true, 
                    action = activo ? "activated" : "deactivated", 
                    message = message 
                });
            }
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { status = 404, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al cambiar el estado del servicio.", details = ex.Message });
        }
    }
}

