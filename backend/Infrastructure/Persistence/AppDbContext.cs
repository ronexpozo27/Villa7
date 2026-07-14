using Microsoft.EntityFrameworkCore;
using Villa7.Domain.Entities;

namespace Villa7.Infrastructure.Persistence;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Usuario> Usuarios { get; set; } = null!;
    public DbSet<Habitacion> Habitaciones { get; set; } = null!;
    public DbSet<Servicio> Servicios { get; set; } = null!;
    public DbSet<Reserva> Reservas { get; set; } = null!;
    public DbSet<ReservaServicio> ReservaServicios { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // 1. Mapeo de la entidad Usuario
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.ToTable("usuarios", t => t.HasCheckConstraint("CK_usuarios_rol", "rol IN ('Cliente', 'Administrador')"));
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(150).IsRequired();
            entity.Property(e => e.Correo).HasColumnName("correo").HasMaxLength(100).IsRequired();
            entity.Property(e => e.PasswordHash).HasColumnName("password_hash").HasMaxLength(255).IsRequired();
            entity.Property(e => e.Rol).HasColumnName("rol").HasMaxLength(20).IsRequired();
            entity.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion").HasDefaultValueSql("NOW()").IsRequired();
            entity.Property(e => e.RefreshToken).HasColumnName("refresh_token").HasMaxLength(255);
            entity.Property(e => e.RefreshTokenExpiracion).HasColumnName("refresh_token_expiracion");
            entity.Property(e => e.Activo).HasColumnName("activo").HasDefaultValue(true).IsRequired();
            entity.Property(e => e.FechaCambioEstado).HasColumnName("fecha_cambio_estado");
            entity.Property(e => e.UsuarioCambioEstado).HasColumnName("usuario_cambio_estado").HasMaxLength(255);
            entity.Property(e => e.MotivoCambioEstado).HasColumnName("motivo_cambio_estado").HasMaxLength(1000);

            entity.HasIndex(e => e.Correo).IsUnique();
        });

        // 2. Mapeo de la entidad Habitacion
        modelBuilder.Entity<Habitacion>(entity =>
        {
            entity.ToTable("habitaciones", t =>
            {
                t.HasCheckConstraint("CK_habitaciones_capacidad_max", "capacidad_max > 0");
                t.HasCheckConstraint("CK_habitaciones_precio_por_noche", "precio_por_noche > 0");
            });
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.CapacidadMax).HasColumnName("capacidad_max").IsRequired();
            entity.Property(e => e.PrecioPorNoche).HasColumnName("precio_por_noche").HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.Activa).HasColumnName("activa").HasDefaultValue(true).IsRequired();
            entity.Property(e => e.ImagenUrl).HasColumnName("imagen_url").HasMaxLength(2048);
            entity.Property(e => e.ImagenStoragePath).HasColumnName("imagen_storage_path").HasMaxLength(1000);
            entity.Property(e => e.Ubicacion).HasColumnName("ubicacion").HasMaxLength(500);
            entity.Property(e => e.FechaCambioEstado).HasColumnName("fecha_cambio_estado");
            entity.Property(e => e.UsuarioCambioEstado).HasColumnName("usuario_cambio_estado").HasMaxLength(255);
            entity.Property(e => e.MotivoCambioEstado).HasColumnName("motivo_cambio_estado").HasMaxLength(1000);

            entity.HasIndex(e => e.Nombre).IsUnique();
        });

        // 3. Mapeo de la entidad Servicio
        modelBuilder.Entity<Servicio>(entity =>
        {
            entity.ToTable("servicios", t => t.HasCheckConstraint("CK_servicios_precio", "precio >= 0"));
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.Nombre).HasColumnName("nombre").HasMaxLength(100).IsRequired();
            entity.Property(e => e.Descripcion).HasColumnName("descripcion");
            entity.Property(e => e.Precio).HasColumnName("precio").HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.Activo).HasColumnName("activo").HasDefaultValue(true).IsRequired();
            entity.Property(e => e.FechaCambioEstado).HasColumnName("fecha_cambio_estado");
            entity.Property(e => e.UsuarioCambioEstado).HasColumnName("usuario_cambio_estado").HasMaxLength(255);
            entity.Property(e => e.MotivoCambioEstado).HasColumnName("motivo_cambio_estado").HasMaxLength(1000);

            entity.HasIndex(e => e.Nombre).IsUnique();
        });

        // 4. Mapeo de la entidad Reserva
        modelBuilder.Entity<Reserva>(entity =>
        {
            entity.ToTable("reservas", t =>
            {
                t.HasCheckConstraint("CK_reservas_estado", "estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada', 'Anulada')");
                t.HasCheckConstraint("CK_reservas_fechas", "fecha_salida > fecha_entrada");
                t.HasCheckConstraint("CK_reservas_total_calculado", "total_calculado >= 0");
            });
            entity.HasKey(e => e.Id);
            entity.Property(e => e.Id).HasColumnName("id");
            entity.Property(e => e.UsuarioId).HasColumnName("usuario_id").IsRequired();
            entity.Property(e => e.HabitacionId).HasColumnName("habitacion_id").IsRequired();
            entity.Property(e => e.FechaEntrada).HasColumnName("fecha_entrada").HasColumnType("date").IsRequired();
            entity.Property(e => e.FechaSalida).HasColumnName("fecha_salida").HasColumnType("date").IsRequired();
            entity.Property(e => e.Estado).HasColumnName("estado").HasMaxLength(20).IsRequired();
            entity.Property(e => e.TotalCalculado).HasColumnName("total_calculado").HasColumnType("decimal(10,2)").IsRequired();
            entity.Property(e => e.FechaCreacion).HasColumnName("fecha_creacion").HasDefaultValueSql("NOW()").IsRequired();
            entity.Property(e => e.FechaCancelacion).HasColumnName("fecha_cancelacion");
            entity.Property(e => e.FechaCambioEstado).HasColumnName("fecha_cambio_estado");
            entity.Property(e => e.UsuarioCambioEstado).HasColumnName("usuario_cambio_estado").HasMaxLength(255);
            entity.Property(e => e.MotivoCambioEstado).HasColumnName("motivo_cambio_estado").HasMaxLength(1000);

            // Relaciones
            entity.HasOne(d => d.Usuario)
                .WithMany()
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.Restrict);

            entity.HasOne(d => d.Habitacion)
                .WithMany()
                .HasForeignKey(d => d.HabitacionId)
                .OnDelete(DeleteBehavior.Restrict);

            // Índices optimizados (Paso 7 del diseño físico)
            entity.HasIndex(e => e.UsuarioId)
                .HasDatabaseName("IX_reservas_usuario_id");

            entity.HasIndex(e => e.Estado)
                .HasDatabaseName("IX_reservas_estado");

            entity.HasIndex(e => new { e.HabitacionId, e.FechaEntrada, e.FechaSalida })
                .HasDatabaseName("IX_reservas_habitacion_fechas")
                .HasFilter("estado IN ('Pendiente', 'Confirmada')");
        });

        // 5. Mapeo de la entidad asociativa ReservaServicio
        modelBuilder.Entity<ReservaServicio>(entity =>
        {
            entity.ToTable("reserva_servicios", t => t.HasCheckConstraint("CK_reserva_servicios_precio_contratado", "precio_contratado >= 0"));
            entity.HasKey(e => new { e.ReservaId, e.ServicioId });
            entity.Property(e => e.ReservaId).HasColumnName("reserva_id");
            entity.Property(e => e.ServicioId).HasColumnName("servicio_id");
            entity.Property(e => e.PrecioContratado).HasColumnName("precio_contratado").HasColumnType("decimal(10,2)").IsRequired();

            // Relaciones
            entity.HasOne(d => d.Reserva)
                .WithMany(p => p.ReservaServicios)
                .HasForeignKey(d => d.ReservaId)
                .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(d => d.Servicio)
                .WithMany()
                .HasForeignKey(d => d.ServicioId)
                .OnDelete(DeleteBehavior.Restrict);
        });
    }
}
