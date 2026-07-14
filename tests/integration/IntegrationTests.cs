using System;
using System.Collections.Generic;
using System.IO;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Threading.Tasks;
using FluentAssertions;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.Extensions.DependencyInjection;
using Villa7.Application.DTOs.Auth;
using Villa7.Application.DTOs.Habitacion;
using Villa7.Application.DTOs.Reserva;
using Villa7.Application.DTOs.Servicio;
using Villa7.Infrastructure.Persistence;
using Xunit;

namespace Villa7.IntegrationTests;

public class IntegrationTests : IClassFixture<WebApplicationFactory<Program>>, IAsyncDisposable
{
    private readonly WebApplicationFactory<Program> _factory;
    private readonly HttpClient _client;
    private readonly List<Guid> _roomsToClean = new();
    private readonly List<Guid> _servicesToClean = new();
    private readonly List<Guid> _reservationsToClean = new();
    private readonly List<Guid> _usersToClean = new();

    public IntegrationTests(WebApplicationFactory<Program> factory)
    {
        _factory = factory;
        _client = _factory.CreateClient();
    }

    private async Task<string> LoginAsAdminAsync()
    {
        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginDto
        {
            Correo = "admin@villa7.com",
            Password = "Admin123"
        });
        
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var auth = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        return auth!.AccessToken;
    }

    private async Task<(string token, Guid userId)> RegisterAndLoginClientAsync(string email)
    {
        var regResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", new RegisterDto
        {
            Nombre = "Cliente Integracion",
            Correo = email,
            Password = "Password123!"
        });
        
        regResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var auth = await regResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        
        _usersToClean.Add(auth!.Usuario.Id);
        
        return (auth.AccessToken, auth.Usuario.Id);
    }

    // ==========================================
    // 1. AUTENTICACIÓN Y PROTECCIÓN DE RUTAS
    // ==========================================
    [Fact]
    public async Task Auth_ShouldRegister_Login_AndEnforceRouteProtection()
    {
        var testEmail = $"integration-auth-{Guid.NewGuid()}@test.com";

        // 1.1 Registro de nuevo cliente
        var regResponse = await _client.PostAsJsonAsync("/api/v1/auth/register", new RegisterDto
        {
            Nombre = "User Auth Test",
            Correo = testEmail,
            Password = "Password123!"
        });
        regResponse.StatusCode.Should().Be(HttpStatusCode.Created);
        var authResult = await regResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        authResult.Should().NotBeNull();
        authResult!.AccessToken.Should().NotBeNullOrWhiteSpace();
        _usersToClean.Add(authResult.Usuario.Id);

        // 1.2 Login del cliente
        var loginResponse = await _client.PostAsJsonAsync("/api/v1/auth/login", new LoginDto
        {
            Correo = testEmail,
            Password = "Password123!"
        });
        loginResponse.StatusCode.Should().Be(HttpStatusCode.OK);
        var loginResult = await loginResponse.Content.ReadFromJsonAsync<AuthResponseDto>();
        loginResult.Should().NotBeNull();
        loginResult!.AccessToken.Should().NotBeNullOrWhiteSpace();

        // 1.3 Protección de rutas (sin token JWT)
        var unauthResponse = await _client.GetAsync("/api/v1/clientes");
        unauthResponse.StatusCode.Should().Be(HttpStatusCode.Unauthorized);

        // 1.4 Acceso con token (Rol Cliente no puede ver clientes)
        var clientReq = new HttpRequestMessage(HttpMethod.Get, "/api/v1/clientes");
        clientReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", loginResult.AccessToken);
        var forbidResponse = await _client.SendAsync(clientReq);
        forbidResponse.StatusCode.Should().Be(HttpStatusCode.Forbidden);

        // 1.5 Acceso con token (Rol Administrador sí puede ver clientes)
        var adminToken = await LoginAsAdminAsync();
        var adminReq = new HttpRequestMessage(HttpMethod.Get, "/api/v1/clientes");
        adminReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var successResponse = await _client.SendAsync(adminReq);
        successResponse.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // ==========================================
    // 2. CRUD DE HABITACIONES Y SERVICIOS
    // ==========================================
    [Fact]
    public async Task HabitacionesYServicios_CRUD_ShouldPersistCorrectly()
    {
        var adminToken = await LoginAsAdminAsync();

        // 2.1 Crear Habitación (Admin)
        var roomName = $"Cabaña Integracion {Guid.NewGuid()}";
        var createRoomReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/habitaciones")
        {
            Content = JsonContent.Create(new CrearHabitacionDto
            {
                Nombre = roomName,
                Descripcion = "Cabaña de pruebas de integración con chimenea.",
                CapacidadMax = 4,
                PrecioPorNoche = 299.99m,
                Ubicacion = "Sector A, Parcela 5"
            })
        };
        createRoomReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var createRoomRes = await _client.SendAsync(createRoomReq);
        createRoomRes.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createdRoom = await createRoomRes.Content.ReadFromJsonAsync<HabitacionDto>();
        createdRoom.Should().NotBeNull();
        createdRoom!.Id.Should().NotBeEmpty();
        _roomsToClean.Add(createdRoom.Id);

        // 2.2 Consulta pública de habitaciones
        var getRoomsRes = await _client.GetAsync("/api/v1/habitaciones");
        getRoomsRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var roomsList = await getRoomsRes.Content.ReadFromJsonAsync<List<HabitacionDto>>();
        roomsList.Should().Contain(r => r.Id == createdRoom.Id);

        // 2.3 Detalle de habitación
        var getRoomDetailRes = await _client.GetAsync($"/api/v1/habitaciones/{createdRoom.Id}");
        getRoomDetailRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var detailedRoom = await getRoomDetailRes.Content.ReadFromJsonAsync<HabitacionDto>();
        detailedRoom!.Ubicacion.Should().Be("Sector A, Parcela 5");

        // 2.4 Editar Habitación (Admin)
        var editRoomReq = new HttpRequestMessage(HttpMethod.Put, $"/api/v1/habitaciones/{createdRoom.Id}")
        {
            Content = JsonContent.Create(new EditarHabitacionDto
            {
                Nombre = roomName,
                Descripcion = "Cabaña de pruebas modificada.",
                CapacidadMax = 6,
                PrecioPorNoche = 320.00m,
                Ubicacion = "Sector A, Parcela 5 modificada"
            })
        };
        editRoomReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var editRoomRes = await _client.SendAsync(editRoomReq);
        editRoomRes.StatusCode.Should().Be(HttpStatusCode.NoContent);

        // 2.5 Crear Servicio (Admin)
        var serviceName = $"Catering Integracion {Guid.NewGuid()}";
        var createServiceReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/servicios")
        {
            Content = JsonContent.Create(new CrearServicioDto
            {
                Nombre = serviceName,
                Descripcion = "Servicio de catering completo",
                Precio = 80.00m
            })
        };
        createServiceReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var createServiceRes = await _client.SendAsync(createServiceReq);
        createServiceRes.StatusCode.Should().Be(HttpStatusCode.Created);
        
        var createdService = await createServiceRes.Content.ReadFromJsonAsync<ServicioDto>();
        createdService.Should().NotBeNull();
        _servicesToClean.Add(createdService!.Id);

        // 2.6 Listar servicios
        var getServicesRes = await _client.GetAsync("/api/v1/servicios");
        getServicesRes.StatusCode.Should().Be(HttpStatusCode.OK);
        var servicesList = await getServicesRes.Content.ReadFromJsonAsync<List<ServicioDto>>();
        servicesList.Should().Contain(s => s.Id == createdService.Id);

        // 2.7 Desactivación de Habitación (Admin)
        var toggleRoomReq = new HttpRequestMessage(HttpMethod.Patch, $"/api/v1/habitaciones/{createdRoom.Id}/estado")
        {
            Content = JsonContent.Create(false)
        };
        toggleRoomReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var toggleRoomRes = await _client.SendAsync(toggleRoomReq);
        toggleRoomRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // ==========================================
    // 3. FLUX SUPABASE STORAGE
    // ==========================================
    [Fact]
    public async Task SupabaseStorage_ImageUploadAndDeletion_ShouldSyncWithPostgres()
    {
        var adminToken = await LoginAsAdminAsync();

        // 3.1 Registrar habitación temporal
        var roomName = $"Cabaña Storage Integracion {Guid.NewGuid()}";
        var createRoomReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/habitaciones")
        {
            Content = JsonContent.Create(new CrearHabitacionDto
            {
                Nombre = roomName,
                Descripcion = "Cabaña para probar storage.",
                CapacidadMax = 2,
                PrecioPorNoche = 150.00m,
                Ubicacion = "Bosque"
            })
        };
        createRoomReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var createRoomRes = await _client.SendAsync(createRoomReq);
        var createdRoom = await createRoomRes.Content.ReadFromJsonAsync<HabitacionDto>();
        _roomsToClean.Add(createdRoom!.Id);

        // 3.2 Subir imagen real
        var fileContent = new ByteArrayContent(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }); // Mock PNG bytes
        fileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/png");

        var formData = new MultipartFormDataContent();
        formData.Add(fileContent, "file", "integration-upload.png");

        var uploadReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/habitaciones/{createdRoom.Id}/imagen")
        {
            Content = formData
        };
        uploadReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var uploadRes = await _client.SendAsync(uploadReq);
        uploadRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var uploadResult = await uploadRes.Content.ReadFromJsonAsync<HabitacionDto>();
        uploadResult.Should().NotBeNull();
        uploadResult!.ImagenUrl.Should().NotBeNullOrEmpty();
        uploadResult.ImagenStoragePath.Should().NotBeNullOrEmpty();

        // 3.3 Reemplazar imagen
        var newFileContent = new ByteArrayContent(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10, 99 });
        newFileContent.Headers.ContentType = MediaTypeHeaderValue.Parse("image/png");

        var newFormData = new MultipartFormDataContent();
        newFormData.Add(newFileContent, "file", "integration-replaced.png");

        var replaceReq = new HttpRequestMessage(HttpMethod.Post, $"/api/v1/habitaciones/{createdRoom.Id}/imagen")
        {
            Content = newFormData
        };
        replaceReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var replaceRes = await _client.SendAsync(replaceReq);
        replaceRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var replaceResult = await replaceRes.Content.ReadFromJsonAsync<HabitacionDto>();
        replaceResult!.ImagenUrl.Should().NotBe(uploadResult.ImagenUrl);

        // 3.4 Eliminar imagen
        var deleteReq = new HttpRequestMessage(HttpMethod.Delete, $"/api/v1/habitaciones/{createdRoom.Id}/imagen");
        deleteReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var deleteRes = await _client.SendAsync(deleteReq);
        deleteRes.StatusCode.Should().Be(HttpStatusCode.OK);

        var deleteResult = await deleteRes.Content.ReadFromJsonAsync<HabitacionDto>();
        deleteResult!.ImagenUrl.Should().BeNull();
        deleteResult.ImagenStoragePath.Should().BeNull();
    }

    // ==========================================
    // 4. RESERVAS (CREACIÓN, DISPONIBILIDAD, CÁLCULO)
    // ==========================================
    [Fact]
    public async Task Reservas_Completo_ShouldCheckAvailabilityCalculateTotalAndCancel()
    {
        var adminToken = await LoginAsAdminAsync();
        var clientEmail = $"integration-client-{Guid.NewGuid()}@test.com";
        var (clientToken, clientId) = await RegisterAndLoginClientAsync(clientEmail);

        // 4.1 Crear Cabaña (precio S/ 200.00 por noche)
        var roomName = $"Cabaña Reservas Integracion {Guid.NewGuid()}";
        var createRoomReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/habitaciones")
        {
            Content = JsonContent.Create(new CrearHabitacionDto
            {
                Nombre = roomName,
                Descripcion = "Cabaña de pruebas de reservas.",
                CapacidadMax = 4,
                PrecioPorNoche = 200.00m,
                Ubicacion = "Bosque"
            })
        };
        createRoomReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var createRoomRes = await _client.SendAsync(createRoomReq);
        var createdRoom = await createRoomRes.Content.ReadFromJsonAsync<HabitacionDto>();
        _roomsToClean.Add(createdRoom!.Id);

        // 4.2 Crear Servicio adicional (S/ 50.00)
        var serviceName = $"Catering Reservas Integracion {Guid.NewGuid()}";
        var createServiceReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/servicios")
        {
            Content = JsonContent.Create(new CrearServicioDto
            {
                Nombre = serviceName,
                Descripcion = "Servicio adicional de reservas",
                Precio = 50.00m
            })
        };
        createServiceReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", adminToken);
        var createServiceRes = await _client.SendAsync(createServiceReq);
        var createdService = await createServiceRes.Content.ReadFromJsonAsync<ServicioDto>();
        _servicesToClean.Add(createdService!.Id);

        // 4.3 Crear Reserva (3 noches, del día +10 al +13)
        // Total esperado: (3 noches * 200) + 50 = 600 + 50 = S/ 650.00
        var checkIn = DateTime.UtcNow.AddDays(10).ToString("yyyy-MM-dd");
        var checkOut = DateTime.UtcNow.AddDays(13).ToString("yyyy-MM-dd");

        var createReservaReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/reservas")
        {
            Content = JsonContent.Create(new CrearReservaDto
            {
                HabitacionId = createdRoom.Id,
                FechaEntrada = DateTime.Parse(checkIn),
                FechaSalida = DateTime.Parse(checkOut),
                ServiciosIds = new List<Guid> { createdService.Id }
            })
        };
        createReservaReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientToken);
        var createReservaRes = await _client.SendAsync(createReservaReq);
        createReservaRes.StatusCode.Should().Be(HttpStatusCode.Created);

        var createdReserva = await createReservaRes.Content.ReadFromJsonAsync<ReservaDto>();
        createdReserva.Should().NotBeNull();
        createdReserva!.TotalCalculado.Should().Be(650.00m);
        createdReserva.Estado.Should().Be("Pendiente");
        _reservationsToClean.Add(createdReserva.Id);

        // 4.4 Intentar reservar en fechas con traslape (Doble Reserva)
        var doubleReservaReq = new HttpRequestMessage(HttpMethod.Post, "/api/v1/reservas")
        {
            Content = JsonContent.Create(new CrearReservaDto
            {
                HabitacionId = createdRoom.Id,
                FechaEntrada = DateTime.Parse(checkIn),
                FechaSalida = DateTime.Parse(checkOut),
                ServiciosIds = new List<Guid>()
            })
        };
        doubleReservaReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientToken);
        var doubleReservaRes = await _client.SendAsync(doubleReservaReq);
        doubleReservaRes.StatusCode.Should().Be(HttpStatusCode.Conflict); // 409 Conflict

        // 4.5 Cancelar la Reserva (Cliente)
        var cancelReq = new HttpRequestMessage(HttpMethod.Patch, $"/api/v1/reservas/{createdReserva.Id}/cancelar");
        cancelReq.Headers.Authorization = new AuthenticationHeaderValue("Bearer", clientToken);
        var cancelRes = await _client.SendAsync(cancelReq);
        cancelRes.StatusCode.Should().Be(HttpStatusCode.NoContent);
    }

    // ==========================================
    // CLEANUP AUTOMÁTICO EN BD
    // ==========================================
    public async ValueTask DisposeAsync()
    {
        using var scope = _factory.Services.CreateScope();
        var context = scope.ServiceProvider.GetRequiredService<AppDbContext>();

        // Borrar reservas creadas
        foreach (var id in _reservationsToClean)
        {
            var res = await context.Reservas.FindAsync(id);
            if (res != null)
            {
                // Limpiar servicios contratados de la reserva para no violar FKs
                context.ReservaServicios.RemoveRange(res.ReservaServicios);
                context.Reservas.Remove(res);
            }
        }

        // Borrar servicios creados
        foreach (var id in _servicesToClean)
        {
            var srv = await context.Servicios.FindAsync(id);
            if (srv != null) context.Servicios.Remove(srv);
        }

        // Borrar habitaciones creadas
        foreach (var id in _roomsToClean)
        {
            var rm = await context.Habitaciones.FindAsync(id);
            if (rm != null) context.Habitaciones.Remove(rm);
        }

        // Borrar usuarios creados
        foreach (var id in _usersToClean)
        {
            var usr = await context.Usuarios.FindAsync(id);
            if (usr != null) context.Usuarios.Remove(usr);
        }

        await context.SaveChangesAsync();
    }
}
