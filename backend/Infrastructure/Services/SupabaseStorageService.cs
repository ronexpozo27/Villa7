using System;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Text.Json;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using Villa7.Application.Interfaces;

namespace Villa7.Infrastructure.Services;

public class SupabaseStorageService : IStorageService
{
    private readonly HttpClient _httpClient;
    private readonly string _supabaseUrl;
    private readonly string _serviceRoleKey;

    public SupabaseStorageService(IConfiguration configuration)
    {
        _supabaseUrl = configuration["Supabase__Url"] 
            ?? configuration["Supabase:Url"] 
            ?? throw new InvalidOperationException("Supabase URL is not configured. Please define Supabase__Url.");

        _serviceRoleKey = configuration["Supabase__ServiceRoleKey"] 
            ?? configuration["Supabase:ServiceRoleKey"] 
            ?? throw new InvalidOperationException("Supabase Service Role Key is not configured. Please define Supabase__ServiceRoleKey.");

        _httpClient = new HttpClient();
    }

    public async Task<bool> BucketExistsAsync(string bucketName)
    {
        var requestUrl = $"{_supabaseUrl.TrimEnd('/')}/storage/v1/bucket/{bucketName}";
        using var request = new HttpRequestMessage(HttpMethod.Get, requestUrl);
        
        request.Headers.Add("apikey", _serviceRoleKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceRoleKey);

        try
        {
            using var response = await _httpClient.SendAsync(request);
            if (response.StatusCode == HttpStatusCode.OK)
            {
                return true;
            }
            if (response.StatusCode == HttpStatusCode.NotFound)
            {
                return false;
            }
            
            var content = await response.Content.ReadAsStringAsync();
            throw new HttpRequestException($"Supabase storage error ({response.StatusCode}): {content}");
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Error al verificar la existencia del bucket '{bucketName}': {ex.Message}", ex);
        }
    }

    public async Task<string> UploadFileAsync(string bucketName, string fileName, Stream fileStream, string contentType)
    {
        var requestUrl = $"{_supabaseUrl.TrimEnd('/')}/storage/v1/object/{bucketName}/{fileName}";
        using var request = new HttpRequestMessage(HttpMethod.Post, requestUrl);

        request.Headers.Add("apikey", _serviceRoleKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceRoleKey);

        // Upload stream as binary payload
        using var content = new StreamContent(fileStream);
        content.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        request.Content = content;

        try
        {
            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Supabase storage upload failed ({response.StatusCode}): {errorMsg}");
            }

            // Return the public URL
            return $"{_supabaseUrl.TrimEnd('/')}/storage/v1/object/public/{bucketName}/{fileName}";
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Fallo al subir el archivo '{fileName}' al bucket '{bucketName}': {ex.Message}", ex);
        }
    }

    public async Task DeleteFileAsync(string bucketName, string fileName)
    {
        var requestUrl = $"{_supabaseUrl.TrimEnd('/')}/storage/v1/object/{bucketName}";
        using var request = new HttpRequestMessage(HttpMethod.Delete, requestUrl);

        request.Headers.Add("apikey", _serviceRoleKey);
        request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", _serviceRoleKey);

        var payload = new { prefixes = new[] { fileName } };
        var json = JsonSerializer.Serialize(payload);
        request.Content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            using var response = await _httpClient.SendAsync(request);
            if (!response.IsSuccessStatusCode)
            {
                var errorMsg = await response.Content.ReadAsStringAsync();
                throw new HttpRequestException($"Supabase storage delete failed ({response.StatusCode}): {errorMsg}");
            }
        }
        catch (Exception ex)
        {
            throw new InvalidOperationException($"Fallo al eliminar el archivo '{fileName}' del bucket '{bucketName}': {ex.Message}", ex);
        }
    }
}
