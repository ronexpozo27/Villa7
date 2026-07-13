using Villa7.Application.DTOs.Servicio;
using Villa7.Application.Interfaces;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;

namespace Villa7.Application.Services;

public class ServicioService : IServicioService
{
    private readonly IServicioRepository _servicioRepository;

    public ServicioService(IServicioRepository servicioRepository)
    {
        _servicioRepository = servicioRepository;
    }

    public async Task<List<ServicioDto>> ListActiveAsync()
    {
        var servicios = await _servicioRepository.ListActiveAsync();
        return servicios.Select(MapToDto).ToList();
    }

    public async Task<List<ServicioDto>> ListAllAsync()
    {
        var servicios = await _servicioRepository.ListAllAsync();
        return servicios.Select(MapToDto).ToList();
    }

    public async Task<ServicioDto?> GetByIdAsync(Guid id)
    {
        var servicio = await _servicioRepository.GetByIdAsync(id);
        return servicio == null ? null : MapToDto(servicio);
    }

    public async Task<ServicioDto> CreateAsync(CrearServicioDto dto)
    {
        // Validaciones obligatorias de campos (RN-021, RN-022, RN-027)
        if (string.IsNullOrWhiteSpace(dto.Nombre))
        {
            throw new ArgumentException("El nombre del servicio es obligatorio.");
        }
        if (dto.Precio < 0)
        {
            throw new ArgumentException("El precio del servicio debe ser mayor o igual a cero.");
        }
        if (await _servicioRepository.NombreExistsAsync(dto.Nombre))
        {
            throw new InvalidOperationException("Ya existe un servicio registrado con este nombre.");
        }

        var servicio = new Servicio
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim() ?? string.Empty,
            Precio = dto.Precio,
            Activo = true
        };

        await _servicioRepository.AddAsync(servicio);
        return MapToDto(servicio);
    }

    public async Task UpdateAsync(Guid id, EditarServicioDto dto)
    {
        var servicio = await _servicioRepository.GetByIdAsync(id);
        if (servicio == null)
        {
            throw new KeyNotFoundException("El servicio solicitado no existe.");
        }

        // Validaciones obligatorias (RN-022, RN-027)
        if (string.IsNullOrWhiteSpace(dto.Nombre))
        {
            throw new ArgumentException("El nombre del servicio es obligatorio.");
        }
        if (dto.Precio < 0)
        {
            throw new ArgumentException("El precio del servicio debe ser mayor o igual a cero.");
        }
        if (await _servicioRepository.NombreExistsAsync(dto.Nombre, id))
        {
            throw new InvalidOperationException("Ya existe otro servicio registrado con este nombre.");
        }

        servicio.Nombre = dto.Nombre.Trim();
        servicio.Descripcion = dto.Descripcion?.Trim() ?? string.Empty;
        servicio.Precio = dto.Precio;

        await _servicioRepository.UpdateAsync(servicio);
    }

    public async Task ToggleStatusAsync(Guid id, bool activo)
    {
        var servicio = await _servicioRepository.GetByIdAsync(id);
        if (servicio == null)
        {
            throw new KeyNotFoundException("El servicio solicitado no existe.");
        }

        servicio.Activo = activo;
        await _servicioRepository.UpdateAsync(servicio);
    }

    private static ServicioDto MapToDto(Servicio servicio)
    {
        return new ServicioDto
        {
            Id = servicio.Id,
            Nombre = servicio.Nombre,
            Descripcion = servicio.Descripcion,
            Precio = servicio.Precio,
            Activo = servicio.Activo
        };
    }
}
