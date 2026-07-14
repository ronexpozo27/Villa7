using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Villa7.Application.DTOs.Cliente;
using Villa7.Application.Interfaces;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;
using Villa7.Domain.Exceptions;

namespace Villa7.Application.Services;

public class ClienteService : IClienteService
{
    private readonly IUsuarioRepository _usuarioRepository;
    private readonly IAuditoriaRepository _auditoriaRepository;

    public ClienteService(
        IUsuarioRepository usuarioRepository,
        IAuditoriaRepository auditoriaRepository)
    {
        _usuarioRepository = usuarioRepository;
        _auditoriaRepository = auditoriaRepository;
    }

    public async Task<List<ClienteDto>> ListClientesAsync()
    {
        var clientes = await _usuarioRepository.ListClientesAsync();
        return clientes.Select(c => new ClienteDto
        {
            Id = c.Id,
            Nombre = c.Nombre,
            Correo = c.Correo,
            FechaCreacion = c.FechaCreacion,
            Activo = c.Activo,
            FechaCambioEstado = c.FechaCambioEstado,
            UsuarioCambioEstado = c.UsuarioCambioEstado,
            MotivoCambioEstado = c.MotivoCambioEstado
        }).ToList();
    }

    public async Task<ClienteDto?> GetByIdAsync(Guid id)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null || usuario.Rol != "Cliente")
        {
            return null;
        }

        return new ClienteDto
        {
            Id = usuario.Id,
            Nombre = usuario.Nombre,
            Correo = usuario.Correo,
            FechaCreacion = usuario.FechaCreacion,
            Activo = usuario.Activo,
            FechaCambioEstado = usuario.FechaCambioEstado,
            UsuarioCambioEstado = usuario.UsuarioCambioEstado,
            MotivoCambioEstado = usuario.MotivoCambioEstado
        };
    }

    public async Task<bool> CambiarEstadoAsync(Guid id, bool activo, string? motivo, string adminEmail)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null || usuario.Rol != "Cliente")
        {
            throw new KeyNotFoundException("El cliente solicitado no existe.");
        }

        usuario.Activo = activo;
        usuario.FechaCambioEstado = DateTime.UtcNow;
        usuario.UsuarioCambioEstado = adminEmail;
        usuario.MotivoCambioEstado = motivo;

        await _usuarioRepository.UpdateAsync(usuario);
        return true;
    }

    public async Task DeleteAsync(Guid id, string adminEmail, string? ip, string? motivo)
    {
        var usuario = await _usuarioRepository.GetByIdAsync(id);
        if (usuario == null || usuario.Rol != "Cliente")
        {
            throw new KeyNotFoundException("El cliente solicitado no existe.");
        }

        // 1. Validar que el cliente esté inactivo
        if (usuario.Activo)
        {
            throw new BusinessRuleException("No se puede eliminar un cliente activo. Debe desactivarse primero.");
        }

        // 2. Validar que nunca haya realizado una reserva
        if (await _usuarioRepository.HasAnyBookingsAsync(id))
        {
            throw new BusinessRuleException("No es posible eliminar un cliente que posee reservas asociadas.");
        }

        // 3. Registrar auditoría de eliminación
        var auditoria = new AuditoriaEliminacion
        {
            Id = Guid.NewGuid(),
            Fecha = DateTime.UtcNow,
            Administrador = adminEmail,
            Entidad = "Cliente",
            EntidadId = id,
            Nombre = usuario.Nombre,
            Ip = ip,
            Motivo = motivo ?? "Eliminación administrativa de cliente"
        };
        await _auditoriaRepository.RegistrarEliminacionAsync(auditoria);

        // 4. Eliminar físicamente
        await _usuarioRepository.DeleteAsync(usuario);
    }
}
