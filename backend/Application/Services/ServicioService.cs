using Villa7.Application.DTOs.Servicio;
using Villa7.Application.Interfaces;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Domain.Exceptions;

namespace Villa7.Application.Services;

public class ServicioService : IServicioService
{
    private readonly IServicioRepository _servicioRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;

    public ServicioService(
        IServicioRepository servicioRepository,
        IAuditoriaRepository auditoriaRepository)
    {
        _servicioRepository = servicioRepository;
        _auditoriaRepository = auditoriaRepository;
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
            Activo = servicio.Activo,
            FechaCambioEstado = servicio.FechaCambioEstado,
            UsuarioCambioEstado = servicio.UsuarioCambioEstado,
            MotivoCambioEstado = servicio.MotivoCambioEstado
        };
    }

    public async Task<string> CambiarEstadoAsync(Guid id, bool activo, string? motivo, string adminEmail)
    {
        var servicio = await _servicioRepository.GetByIdAsync(id);
        if (servicio == null)
        {
            throw new KeyNotFoundException("El servicio solicitado no existe.");
        }

        servicio.Activo = activo;
        servicio.FechaCambioEstado = DateTime.UtcNow;
        servicio.UsuarioCambioEstado = adminEmail;
        servicio.MotivoCambioEstado = motivo;

        await _servicioRepository.UpdateAsync(servicio);

        if (!activo)
        {
            var hasBookings = await _servicioRepository.HasBookingsAsync(id);
            if (hasBookings)
            {
                return "El servicio fue desactivado correctamente. Tenga en cuenta que está asociado a reservaciones existentes.";
            }
            return "El servicio fue desactivado correctamente.";
        }
        else
        {
            return "El servicio fue activado correctamente.";
        }
    }

    public async Task DeleteAsync(Guid id, string adminEmail, string? ip, string? motivo)
    {
        var servicio = await _servicioRepository.GetByIdAsync(id);
        if (servicio == null)
        {
            throw new KeyNotFoundException("El servicio solicitado no existe.");
        }

        // 1. Validar que el servicio esté inactivo
        if (servicio.Activo)
        {
            throw new BusinessRuleException("No se puede eliminar un servicio activo. Debe desactivarse primero.");
        }

        // 2. Validar que nunca haya sido utilizado en ninguna reserva
        if (await _servicioRepository.HasBookingsAsync(id))
        {
            throw new BusinessRuleException("No es posible eliminar un servicio que posee reservas asociadas.");
        }

        // 3. Registrar auditoría de eliminación
        var auditoria = new AuditoriaEliminacion
        {
            Id = Guid.NewGuid(),
            Fecha = DateTime.UtcNow,
            Administrador = adminEmail,
            Entidad = "Servicio",
            EntidadId = id,
            Nombre = servicio.Nombre,
            Ip = ip,
            Motivo = motivo ?? "Eliminación administrativa de servicio"
        };
        await _auditoriaRepository.RegistrarEliminacionAsync(auditoria);

        // 4. Eliminar físicamente
        await _servicioRepository.DeleteAsync(servicio);
    }
}

