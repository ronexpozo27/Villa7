using System.IO;
using System.Threading.Tasks;

namespace Villa7.Application.Interfaces;

public interface IStorageService
{
    Task<bool> BucketExistsAsync(string bucketName);
    Task<string> UploadFileAsync(string bucketName, string fileName, Stream fileStream, string contentType);
    Task DeleteFileAsync(string bucketName, string fileName);
}
