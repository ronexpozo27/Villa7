using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Villa7.Application.DTOs.Habitacion;
using Villa7.Application.Interfaces;

namespace Villa7.API.Controllers;

[ApiController]
[Route("api/v1/habitaciones")]
public class HabitacionesController : ControllerBase
{
    private readonly IHabitacionService _habitacionService;
    private readonly IHabitacionImageService _habitacionImageService;

    public HabitacionesController(IHabitacionService habitacionService, IHabitacionImageService habitacionImageService)
    {
        _habitacionService = habitacionService;
        _habitacionImageService = habitacionImageService;
    }

    [HttpGet]
    [AllowAnonymous]
    public async Task<IActionResult> GetActive([FromQuery] DateTime? fechaEntrada, [FromQuery] DateTime? fechaSalida)
    {
        try
        {
            var response = await _habitacionService.ListActiveAsync(fechaEntrada, fechaSalida);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(new { status = 400, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al consultar las habitaciones.", details = ex.Message });
        }
    }

    [HttpGet("admin-list")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> GetAll()
    {
        try
        {
            var response = await _habitacionService.ListAllAsync();
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al obtener el listado completo de habitaciones.", details = ex.Message });
        }
    }

    [HttpGet("{id}")]
    [AllowAnonymous]
    public async Task<IActionResult> GetById(Guid id)
    {
        try
        {
            var response = await _habitacionService.GetByIdAsync(id);
            if (response == null)
            {
                return NotFound(new { status = 404, message = "La habitación solicitada no existe." });
            }
            return Ok(response);
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error al obtener los detalles de la habitación.", details = ex.Message });
        }
    }

    [HttpPost]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Create([FromBody] CrearHabitacionDto dto)
    {
        try
        {
            var response = await _habitacionService.CreateAsync(dto);
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
            return StatusCode(500, new { message = "Ocurrió un error al registrar la habitación.", details = ex.Message });
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> Update(Guid id, [FromBody] EditarHabitacionDto dto)
    {
        try
        {
            await _habitacionService.UpdateAsync(id, dto);
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
            return StatusCode(500, new { message = "Ocurrió un error al actualizar la habitación.", details = ex.Message });
        }
    }

    [HttpPatch("{id}/estado")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> ToggleStatus(Guid id, [FromBody] bool activa)
    {
        try
        {
            await _habitacionService.ToggleStatusAsync(id, activa);
            return NoContent();
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
            return StatusCode(500, new { message = "Ocurrió un error al cambiar el estado de la habitación.", details = ex.Message });
        }
    }

    [HttpPost("{id}/imagen")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> UploadImage(Guid id, IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            return BadRequest(new { status = 400, message = "El archivo es requerido y no puede estar vacío." });
        }

        try
        {
            using var stream = file.OpenReadStream();
            var result = await _habitacionImageService.UploadImageAsync(id, stream, file.FileName, file.ContentType, file.Length);
            return Ok(result);
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
            return StatusCode(500, new { message = "Ocurrió un error inesperado al subir la imagen.", details = ex.Message });
        }
    }

    [HttpDelete("{id}/imagen")]
    [Authorize(Roles = "Administrador")]
    public async Task<IActionResult> DeleteImage(Guid id)
    {
        try
        {
            var result = await _habitacionImageService.DeleteImageAsync(id);
            return Ok(result);
        }
        catch (KeyNotFoundException ex)
        {
            return NotFound(new { status = 404, message = ex.Message });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = "Ocurrió un error inesperado al eliminar la imagen.", details = ex.Message });
        }
    }
}
