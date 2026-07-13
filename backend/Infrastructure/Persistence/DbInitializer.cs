using BCrypt.Net;
using Villa7.Domain.Entities;

namespace Villa7.Infrastructure.Persistence;

public static class DbInitializer
{
    public static void Initialize(AppDbContext context)
    {
        // Asegura que la base de datos esté creada (las migraciones ya deben estar aplicadas)
        context.Database.EnsureCreated();

        // 1. Inicializar Usuarios
        if (!context.Usuarios.Any())
        {
            var admin = new Usuario
            {
                Id = Guid.NewGuid(),
                Nombre = "Administrador de Villa7",
                Correo = "admin@villa7.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Admin123"),
                Rol = "Administrador",
                FechaCreacion = DateTime.UtcNow
            };

            var cliente = new Usuario
            {
                Id = Guid.NewGuid(),
                Nombre = "Cliente Demo",
                Correo = "cliente@villa7.com",
                PasswordHash = BCrypt.Net.BCrypt.HashPassword("Cliente123"),
                Rol = "Cliente",
                FechaCreacion = DateTime.UtcNow
            };

            context.Usuarios.AddRange(admin, cliente);
        }

        // 2. Inicializar Habitaciones
        if (!context.Habitaciones.Any())
        {
            var habitacion1 = new Habitacion
            {
                Id = Guid.NewGuid(),
                Nombre = "Cabaña Vista Hermosa",
                Descripcion = "Acogedora cabaña frente al lago con capacidad para 4 personas, terraza privada y parrilla.",
                CapacidadMax = 4,
                PrecioPorNoche = 120.00m,
                Activa = true
            };

            var habitacion2 = new Habitacion
            {
                Id = Guid.NewGuid(),
                Nombre = "Cabaña Bosque Verde",
                Descripcion = "Hermosa cabaña rústica rodeada de naturaleza, ideal para parejas que buscan tranquilidad.",
                CapacidadMax = 2,
                PrecioPorNoche = 85.00m,
                Activa = true
            };

            var habitacion3 = new Habitacion
            {
                Id = Guid.NewGuid(),
                Nombre = "Suite Premium Montaña",
                Descripcion = "Suite de lujo con cama King, chimenea, jacuzzi privado y una espectacular vista a las montañas.",
                CapacidadMax = 2,
                PrecioPorNoche = 150.00m,
                Activa = true
            };

            context.Habitaciones.AddRange(habitacion1, habitacion2, habitacion3);
        }

        // 3. Inicializar Servicios
        if (!context.Servicios.Any())
        {
            var servicio1 = new Servicio
            {
                Id = Guid.NewGuid(),
                Nombre = "Paseo a Caballo",
                Descripcion = "Recorrido guiado de 2 horas por los senderos campestres del valle.",
                Precio = 25.00m,
                Activo = true
            };

            var servicio2 = new Servicio
            {
                Id = Guid.NewGuid(),
                Nombre = "Pensión Completa",
                Descripcion = "Acceso a desayuno, almuerzo y cena buffet en nuestro restaurante con insumos orgánicos.",
                Precio = 60.00m,
                Activo = true
            };

            var servicio3 = new Servicio
            {
                Id = Guid.NewGuid(),
                Nombre = "Acceso al Spa",
                Descripcion = "Sesión de sauna húmedo/seco, masajes descontracturantes y piscina climatizada.",
                Precio = 40.00m,
                Activo = true
            };

            context.Servicios.AddRange(servicio1, servicio2, servicio3);
        }

        // Guardar todos los cambios en la base de datos
        context.SaveChanges();
    }
}
