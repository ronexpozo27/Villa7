using System;
using System.IO;
using System.Threading.Tasks;
using Villa7.Application.DTOs.Habitacion;

namespace Villa7.Application.Interfaces;

public interface IHabitacionImageService
{
    Task<HabitacionDto> UploadImageAsync(Guid habitacionId, Stream fileStream, string fileName, string contentType, long length);
    Task<HabitacionDto> DeleteImageAsync(Guid habitacionId);
}
