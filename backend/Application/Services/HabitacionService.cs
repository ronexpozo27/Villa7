using Villa7.Application.DTOs.Habitacion;
using Villa7.Application.Interfaces;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;

namespace Villa7.Application.Services;

public class HabitacionService : IHabitacionService
{
    private readonly IHabitacionRepository _habitacionRepository;

    public HabitacionService(IHabitacionRepository habitacionRepository)
    {
        _habitacionRepository = habitacionRepository;
    }

    public async Task<List<HabitacionDto>> ListActiveAsync(DateTime? fechaEntrada, DateTime? fechaSalida)
    {
        List<Habitacion> habitaciones;

        if (fechaEntrada.HasValue && fechaSalida.HasValue)
        {
            // Validaciones de fechas (RN-031, RN-032)
            if (fechaEntrada.Value.Date < DateTime.UtcNow.Date)
            {
                throw new ArgumentException("La fecha de entrada no puede ser en el pasado.");
            }
            if (fechaSalida.Value.Date <= fechaEntrada.Value.Date)
            {
                throw new ArgumentException("La fecha de salida debe ser posterior a la fecha de entrada.");
            }

            habitaciones = await _habitacionRepository.ListAvailableAsync(fechaEntrada.Value.Date, fechaSalida.Value.Date);
        }
        else
        {
            habitaciones = await _habitacionRepository.ListActiveAsync();
        }

        return habitaciones.Select(MapToDto).ToList();
    }

    public async Task<List<HabitacionDto>> ListAllAsync()
    {
        var habitaciones = await _habitacionRepository.ListAllAsync();
        return habitaciones.Select(MapToDto).ToList();
    }

    public async Task<HabitacionDto?> GetByIdAsync(Guid id)
    {
        var habitacion = await _habitacionRepository.GetByIdAsync(id);
        return habitacion == null ? null : MapToDto(habitacion);
    }

    public async Task<HabitacionDto> CreateAsync(CrearHabitacionDto dto)
    {
        // Validaciones obligatorias de campos (RN-011, RN-013, RN-014)
        if (string.IsNullOrWhiteSpace(dto.Nombre))
        {
            throw new ArgumentException("El nombre de la habitación es obligatorio.");
        }
        if (dto.CapacidadMax <= 0)
        {
            throw new ArgumentException("La capacidad máxima debe ser mayor a cero.");
        }
        if (dto.PrecioPorNoche <= 0)
        {
            throw new ArgumentException("El precio por noche debe ser mayor a cero.");
        }
        if (await _habitacionRepository.NombreExistsAsync(dto.Nombre))
        {
            throw new InvalidOperationException("Ya existe una habitación registrada con este nombre.");
        }

        var habitacion = new Habitacion
        {
            Id = Guid.NewGuid(),
            Nombre = dto.Nombre.Trim(),
            Descripcion = dto.Descripcion?.Trim() ?? string.Empty,
            CapacidadMax = dto.CapacidadMax,
            PrecioPorNoche = dto.PrecioPorNoche,
            Activa = true,
            ImagenUrl = dto.ImagenUrl,
            ImagenStoragePath = dto.ImagenStoragePath,
            Ubicacion = dto.Ubicacion?.Trim()
        };

        await _habitacionRepository.AddAsync(habitacion);
        return MapToDto(habitacion);
    }

    public async Task UpdateAsync(Guid id, EditarHabitacionDto dto)
    {
        var habitacion = await _habitacionRepository.GetByIdAsync(id);
        if (habitacion == null)
        {
            throw new KeyNotFoundException("La habitación solicitada no existe.");
        }

        // Validaciones obligatorias (RN-011, RN-013, RN-014)
        if (string.IsNullOrWhiteSpace(dto.Nombre))
        {
            throw new ArgumentException("El nombre de la habitación es obligatorio.");
        }
        if (dto.CapacidadMax <= 0)
        {
            throw new ArgumentException("La capacidad máxima debe ser mayor a cero.");
        }
        if (dto.PrecioPorNoche <= 0)
        {
            throw new ArgumentException("El precio por noche debe ser mayor a cero.");
        }
        if (await _habitacionRepository.NombreExistsAsync(dto.Nombre, id))
        {
            throw new InvalidOperationException("Ya existe otra habitación registrada con este nombre.");
        }

        habitacion.Nombre = dto.Nombre.Trim();
        habitacion.Descripcion = dto.Descripcion?.Trim() ?? string.Empty;
        habitacion.CapacidadMax = dto.CapacidadMax;
        habitacion.PrecioPorNoche = dto.PrecioPorNoche;
        habitacion.Ubicacion = dto.Ubicacion?.Trim();
        
        if (dto.ImagenUrl != null)
        {
            habitacion.ImagenUrl = dto.ImagenUrl;
        }
        if (dto.ImagenStoragePath != null)
        {
            habitacion.ImagenStoragePath = dto.ImagenStoragePath;
        }

        await _habitacionRepository.UpdateAsync(habitacion);
    }

    public async Task ToggleStatusAsync(Guid id, bool activa)
    {
        var habitacion = await _habitacionRepository.GetByIdAsync(id);
        if (habitacion == null)
        {
            throw new KeyNotFoundException("La habitación solicitada no existe.");
        }

        // Si se va a desactivar, validar que no tenga reservas activas futuras (RN-015)
        if (!activa)
        {
            if (await _habitacionRepository.HasFutureBookingsAsync(id))
            {
                throw new InvalidOperationException("No se puede desactivar la habitación porque tiene reservas pendientes o confirmadas para fechas futuras.");
            }
        }

        habitacion.Activa = activa;
        await _habitacionRepository.UpdateAsync(habitacion);
    }

    private static HabitacionDto MapToDto(Habitacion habitacion)
    {
        return new HabitacionDto
        {
            Id = habitacion.Id,
            Nombre = habitacion.Nombre,
            Descripcion = habitacion.Descripcion,
            CapacidadMax = habitacion.CapacidadMax,
            PrecioPorNoche = habitacion.PrecioPorNoche,
            Activa = habitacion.Activa,
            ImagenUrl = habitacion.ImagenUrl,
            ImagenStoragePath = habitacion.ImagenStoragePath,
            Ubicacion = habitacion.Ubicacion,
            FechaCambioEstado = habitacion.FechaCambioEstado,
            UsuarioCambioEstado = habitacion.UsuarioCambioEstado,
            MotivoCambioEstado = habitacion.MotivoCambioEstado
        };
    }

    public async Task<string> CambiarEstadoAsync(Guid id, bool activa, string? motivo, string adminEmail)
    {
        var habitacion = await _habitacionRepository.GetByIdAsync(id);
        if (habitacion == null)
        {
            throw new KeyNotFoundException("La habitación solicitada no existe.");
        }

        habitacion.Activa = activa;
        habitacion.FechaCambioEstado = DateTime.UtcNow;
        habitacion.UsuarioCambioEstado = adminEmail;
        habitacion.MotivoCambioEstado = motivo;

        await _habitacionRepository.UpdateAsync(habitacion);

        if (!activa)
        {
            var hasFuture = await _habitacionRepository.HasFutureBookingsAsync(id);
            if (hasFuture)
            {
                return "La habitación fue desactivada correctamente. Tenga en cuenta que tiene reservaciones activas o futuras asociadas.";
            }
            return "La habitación fue desactivada correctamente.";
        }
        else
        {
            return "La habitación fue activada correctamente.";
        }
    }
}

