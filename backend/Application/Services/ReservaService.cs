using Villa7.Application.DTOs.Reserva;
using Villa7.Application.Interfaces;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;

namespace Villa7.Application.Services;

public class ReservaService : IReservaService
{
    private readonly IReservaRepository _reservaRepository;
    private readonly IHabitacionRepository _habitacionRepository;
    private readonly IServicioRepository _servicioRepository;

    public ReservaService(
        IReservaRepository reservaRepository,
        IHabitacionRepository habitacionRepository,
        IServicioRepository servicioRepository)
    {
        _reservaRepository = reservaRepository;
        _habitacionRepository = habitacionRepository;
        _servicioRepository = servicioRepository;
    }

    public async Task<ReservaDto> CreateAsync(Guid usuarioId, CrearReservaDto dto)
    {
        var fechaEntradaLocal = dto.FechaEntrada.Date;
        var fechaSalidaLocal = dto.FechaSalida.Date;

        // 1. Validaciones básicas de fechas (RN-031, RN-032)
        if (fechaEntradaLocal < DateTime.UtcNow.Date)
        {
            throw new ArgumentException("La fecha de entrada no puede ser en el pasado.");
        }
        if (fechaSalidaLocal <= fechaEntradaLocal)
        {
            throw new ArgumentException("La fecha de salida debe ser posterior a la fecha de entrada.");
        }

        // 2. Iniciar transacción atómica (RN-034, RSG-01)
        await using var transaction = await _reservaRepository.BeginTransactionAsync();
        try
        {
            // 3. Obtener habitación y validar si está activa
            var habitacion = await _habitacionRepository.GetByIdAsync(dto.HabitacionId);
            if (habitacion == null || !habitacion.Activa)
            {
                throw new ArgumentException("La habitación seleccionada no existe o se encuentra inactiva.");
            }

            // 4. Verificar disponibilidad en base de datos de manera atómica (evitando traslapes concurrentes)
            var isAvailable = await _reservaRepository.IsRoomAvailableAsync(dto.HabitacionId, fechaEntradaLocal, fechaSalidaLocal);
            if (!isAvailable)
            {
                throw new InvalidOperationException("La habitación seleccionada no se encuentra disponible para el rango de fechas solicitado.");
            }

            // 5. Calcular costo de la habitación (tarifa x noches)
            var noches = (fechaSalidaLocal - fechaEntradaLocal).Days;
            var costoHabitacion = habitacion.PrecioPorNoche * noches;

            // 6. Cargar servicios adicionales y validar estado activo
            var reservaServicios = new List<ReservaServicio>();
            decimal costoServicios = 0;

            if (dto.ServiciosIds != null && dto.ServiciosIds.Any())
            {
                foreach (var servicioId in dto.ServiciosIds)
                {
                    var servicio = await _servicioRepository.GetByIdAsync(servicioId);
                    if (servicio == null || !servicio.Activo)
                    {
                        throw new ArgumentException($"El servicio adicional solicitado no existe o está inactivo.");
                    }

                    reservaServicios.Add(new ReservaServicio
                    {
                        ServicioId = servicio.Id,
                        PrecioContratado = servicio.Precio // Copiar precio en este instante (RN-024)
                    });

                    costoServicios += servicio.Precio;
                }
            }

            // 7. Calcular total calculado (RN-050)
            var totalCalculado = costoHabitacion + costoServicios;

            // 8. Crear entidad Reserva (Estado inicial Pendiente como indica RN-035)
            var reserva = new Reserva
            {
                Id = Guid.NewGuid(),
                UsuarioId = usuarioId,
                HabitacionId = habitacion.Id,
                FechaEntrada = fechaEntradaLocal,
                FechaSalida = fechaSalidaLocal,
                Estado = "Pendiente",
                TotalCalculado = totalCalculado,
                FechaCreacion = DateTime.UtcNow,
                ReservaServicios = reservaServicios
            };

            await _reservaRepository.AddAsync(reserva);

            // Commit de la transacción
            await transaction.CommitAsync();

            // Cargar con detalles e información referencial para retornar el DTO
            var createdReserva = await _reservaRepository.GetByIdWithDetailsAsync(reserva.Id);
            return MapToDto(createdReserva!);
        }
        catch
        {
            await transaction.RollbackAsync();
            throw;
        }
    }

    public async Task<List<ReservaDto>> ListByUsuarioIdAsync(Guid usuarioId)
    {
        var reservas = await _reservaRepository.ListByUsuarioIdAsync(usuarioId);
        return reservas.Select(MapToDto).ToList();
    }

    public async Task<List<ReservaDto>> ListAllAsync(string? estado)
    {
        var reservas = await _reservaRepository.ListAllAsync(estado);
        return reservas.Select(MapToDto).ToList();
    }

    public async Task<ReservaDto?> GetByIdAsync(Guid id)
    {
        var reserva = await _reservaRepository.GetByIdWithDetailsAsync(id);
        return reserva == null ? null : MapToDto(reserva);
    }

    public async Task CancelByClientAsync(Guid id, Guid usuarioId)
    {
        var reserva = await _reservaRepository.GetByIdAsync(id);
        if (reserva == null)
        {
            throw new KeyNotFoundException("La reserva solicitada no existe.");
        }

        // Regla: Propietario de la reserva
        if (reserva.UsuarioId != usuarioId)
        {
            throw new UnauthorizedAccessException("No posees los permisos necesarios para cancelar esta reserva.");
        }

        // Regla: Solo se puede cancelar si el estado es Pendiente (RN-051, RN-052)
        if (reserva.Estado != "Pendiente")
        {
            throw new InvalidOperationException("No se puede cancelar una reserva que no esté en estado 'Pendiente'.");
        }

        reserva.Estado = "Cancelada";
        reserva.FechaCancelacion = DateTime.UtcNow;

        await _reservaRepository.UpdateAsync(reserva);
    }

    public async Task ChangeStatusAsync(Guid id, string nuevoEstado)
    {
        var reserva = await _reservaRepository.GetByIdAsync(id);
        if (reserva == null)
        {
            throw new KeyNotFoundException("La reserva solicitada no existe.");
        }

        var estadoActual = reserva.Estado;
        var estadoDestino = nuevoEstado.Trim();

        // Validar transiciones permitidas
        if (estadoActual == "Pendiente")
        {
            if (estadoDestino != "Confirmada" && estadoDestino != "Cancelada")
            {
                throw new InvalidOperationException("Una reserva 'Pendiente' solo puede transicionar a 'Confirmada' o 'Cancelada'.");
            }
        }
        else if (estadoActual == "Confirmada")
        {
            if (estadoDestino != "Completada" && estadoDestino != "Cancelada")
            {
                throw new InvalidOperationException("Una reserva 'Confirmada' solo puede transicionar a 'Completada' o 'Cancelada'.");
            }
        }
        else if (estadoActual == "Cancelada" || estadoActual == "Completada")
        {
            throw new InvalidOperationException($"No se permiten cambios de estado en reservas finalizadas ('{estadoActual}').");
        }

        reserva.Estado = estadoDestino;
        if (estadoDestino == "Cancelada")
        {
            reserva.FechaCancelacion = DateTime.UtcNow;
        }

        await _reservaRepository.UpdateAsync(reserva);
    }

    private static ReservaDto MapToDto(Reserva reserva)
    {
        return new ReservaDto
        {
            Id = reserva.Id,
            UsuarioId = reserva.UsuarioId,
            UsuarioNombre = reserva.Usuario?.Nombre ?? "Usuario Desconocido",
            HabitacionId = reserva.HabitacionId,
            HabitacionNombre = reserva.Habitacion?.Nombre ?? "Habitación Desconocida",
            FechaEntrada = reserva.FechaEntrada,
            FechaSalida = reserva.FechaSalida,
            Estado = reserva.Estado,
            TotalCalculado = reserva.TotalCalculado,
            FechaCreacion = reserva.FechaCreacion,
            FechaCancelacion = reserva.FechaCancelacion,
            ServiciosContratados = reserva.ReservaServicios.Select(rs => new ReservaServicioDto
            {
                ServicioId = rs.ServicioId,
                ServicioNombre = rs.Servicio?.Nombre ?? "Servicio Desconocido",
                PrecioContratado = rs.PrecioContratado
            }).ToList()
        };
    }
}
