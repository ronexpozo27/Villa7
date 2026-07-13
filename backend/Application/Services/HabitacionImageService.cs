using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using System.Collections.Generic;
using Villa7.Application.DTOs.Habitacion;
using Villa7.Application.Interfaces;
using Villa7.Domain.Entities;
using Villa7.Domain.Interfaces.Repositories;

namespace Villa7.Application.Services;

public class HabitacionImageService : IHabitacionImageService
{
    private readonly IHabitacionRepository _habitacionRepository;
    private readonly IStorageService _storageService;

    private static readonly string[] AllowedExtensions = { ".jpg", ".jpeg", ".png", ".webp" };
    private const long MaxFileLengthBytes = 5 * 1024 * 1024; // 5 MB

    public HabitacionImageService(IHabitacionRepository habitacionRepository, IStorageService storageService)
    {
        _habitacionRepository = habitacionRepository;
        _storageService = storageService;
    }

    public async Task<HabitacionDto> UploadImageAsync(Guid habitacionId, Stream fileStream, string fileName, string contentType, long length)
    {
        // 1. Validar Tipo de Archivo (jpg, jpeg, png, webp)
        var extension = Path.GetExtension(fileName)?.ToLowerInvariant();
        if (string.IsNullOrEmpty(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new ArgumentException("Formato de imagen inválido. Solo se admiten archivos .jpg, .jpeg, .png y .webp.");
        }

        // 2. Validar Tamaño Máximo (5 MB)
        if (length > MaxFileLengthBytes)
        {
            throw new ArgumentException("El archivo excede el tamaño máximo permitido de 5 MB.");
        }

        // 3. Validar Existencia de Bucket de Infraestructura
        if (!await _storageService.BucketExistsAsync("habitaciones"))
        {
            throw new InvalidOperationException("El bucket de almacenamiento 'habitaciones' no existe en Supabase. Debe crearse manualmente.");
        }

        // 4. Validar Habitación Existente
        var habitacion = await _habitacionRepository.GetByIdAsync(habitacionId);
        if (habitacion == null)
        {
            throw new KeyNotFoundException("La habitación solicitada no existe.");
        }

        // 5. Cargar Archivo a Supabase
        var uniqueName = $"{Guid.NewGuid()}{extension}";
        string publicUrl;

        try
        {
            publicUrl = await _storageService.UploadFileAsync("habitaciones", uniqueName, fileStream, contentType);
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Error al subir la imagen al servidor de almacenamiento: {ex.Message}", ex);
        }

        // 6. Guardar Cambios en Base de Datos con Orquestación Transaccional (Rollback ante Fallos)
        var oldStoragePath = habitacion.ImagenStoragePath;
        var oldUrl = habitacion.ImagenUrl;

        habitacion.ImagenUrl = publicUrl;
        habitacion.ImagenStoragePath = $"habitaciones/{uniqueName}";

        Console.WriteLine($"[IMAGE_UPLOAD_DEBUG] RoomId: {habitacionId}");
        Console.WriteLine($"[IMAGE_UPLOAD_DEBUG] Generated StoragePath: {habitacion.ImagenStoragePath}");
        Console.WriteLine($"[IMAGE_UPLOAD_DEBUG] Obtained PublicUrl: {habitacion.ImagenUrl}");

        try
        {
            await _habitacionRepository.UpdateAsync(habitacion);
        }
        catch (Exception dbEx)
        {
            // ROLLBACK: Borrar el archivo recién subido al storage para no dejar huérfanos
            try
            {
                await _storageService.DeleteFileAsync("habitaciones", uniqueName);
            }
            catch (Exception deleteEx)
            {
                // Solo loguear el fallo de rollback, pero relanzar la excepción original de BD
                Console.WriteLine($"[ROLLBACK FAILED] No se pudo borrar el archivo subido '{uniqueName}' tras fallo de BD: {deleteEx.Message}");
            }

            throw new InvalidOperationException($"Fallo al actualizar la base de datos con la nueva URL de la imagen. La operación fue revertida. Detalle: {dbEx.Message}", dbEx);
        }

        // 7. Borrar Imagen Antigua si existía una previamente
        if (!string.IsNullOrEmpty(oldStoragePath))
        {
            var oldFileName = oldStoragePath.Replace("habitaciones/", "");
            try
            {
                await _storageService.DeleteFileAsync("habitaciones", oldFileName);
            }
            catch (Exception deleteEx)
            {
                // No abortar el flujo principal de éxito ya que la base de datos y la nueva imagen están bien
                Console.WriteLine($"[WARNING] No se pudo limpiar la imagen anterior del storage '{oldFileName}': {deleteEx.Message}");
            }
        }

        return MapToDto(habitacion);
    }

    public async Task<HabitacionDto> DeleteImageAsync(Guid habitacionId)
    {
        var habitacion = await _habitacionRepository.GetByIdAsync(habitacionId);
        if (habitacion == null)
        {
            throw new KeyNotFoundException("La habitación solicitada no existe.");
        }

        var oldStoragePath = habitacion.ImagenStoragePath;

        if (string.IsNullOrEmpty(oldStoragePath))
        {
            // No hay imagen asociada, devolver tal cual
            return MapToDto(habitacion);
        }

        habitacion.ImagenUrl = null;
        habitacion.ImagenStoragePath = null;

        await _habitacionRepository.UpdateAsync(habitacion);

        // Borrar el archivo físico de Supabase Storage
        var oldFileName = oldStoragePath.Replace("habitaciones/", "");
        try
        {
            await _storageService.DeleteFileAsync("habitaciones", oldFileName);
        }
        catch (Exception deleteEx)
        {
            Console.WriteLine($"[WARNING] No se pudo eliminar el archivo '{oldFileName}' de Supabase Storage: {deleteEx.Message}");
        }

        return MapToDto(habitacion);
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
            ImagenStoragePath = habitacion.ImagenStoragePath
        };
    }
}
