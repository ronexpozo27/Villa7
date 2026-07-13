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
}
