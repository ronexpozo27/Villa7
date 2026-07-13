using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Villa7.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "habitaciones",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false),
                    capacidad_max = table.Column<int>(type: "integer", nullable: false),
                    precio_por_noche = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    activa = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_habitaciones", x => x.id);
                    table.CheckConstraint("CK_habitaciones_capacidad_max", "capacidad_max > 0");
                    table.CheckConstraint("CK_habitaciones_precio_por_noche", "precio_por_noche > 0");
                });

            migrationBuilder.CreateTable(
                name: "servicios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    descripcion = table.Column<string>(type: "text", nullable: false),
                    precio = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    activo = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_servicios", x => x.id);
                    table.CheckConstraint("CK_servicios_precio", "precio >= 0");
                });

            migrationBuilder.CreateTable(
                name: "usuarios",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(150)", maxLength: 150, nullable: false),
                    correo = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    password_hash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    rol = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()")
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_usuarios", x => x.id);
                    table.CheckConstraint("CK_usuarios_rol", "rol IN ('Cliente', 'Administrador')");
                });

            migrationBuilder.CreateTable(
                name: "reservas",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    usuario_id = table.Column<Guid>(type: "uuid", nullable: false),
                    habitacion_id = table.Column<Guid>(type: "uuid", nullable: false),
                    fecha_entrada = table.Column<DateTime>(type: "date", nullable: false),
                    fecha_salida = table.Column<DateTime>(type: "date", nullable: false),
                    estado = table.Column<string>(type: "character varying(20)", maxLength: 20, nullable: false),
                    total_calculado = table.Column<decimal>(type: "numeric(10,2)", nullable: false),
                    fecha_creacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    fecha_cancelacion = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reservas", x => x.id);
                    table.CheckConstraint("CK_reservas_estado", "estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada')");
                    table.CheckConstraint("CK_reservas_fechas", "fecha_salida > fecha_entrada");
                    table.CheckConstraint("CK_reservas_total_calculado", "total_calculado >= 0");
                    table.ForeignKey(
                        name: "FK_reservas_habitaciones_habitacion_id",
                        column: x => x.habitacion_id,
                        principalTable: "habitaciones",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_reservas_usuarios_usuario_id",
                        column: x => x.usuario_id,
                        principalTable: "usuarios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "reserva_servicios",
                columns: table => new
                {
                    reserva_id = table.Column<Guid>(type: "uuid", nullable: false),
                    servicio_id = table.Column<Guid>(type: "uuid", nullable: false),
                    precio_contratado = table.Column<decimal>(type: "numeric(10,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_reserva_servicios", x => new { x.reserva_id, x.servicio_id });
                    table.CheckConstraint("CK_reserva_servicios_precio_contratado", "precio_contratado >= 0");
                    table.ForeignKey(
                        name: "FK_reserva_servicios_reservas_reserva_id",
                        column: x => x.reserva_id,
                        principalTable: "reservas",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_reserva_servicios_servicios_servicio_id",
                        column: x => x.servicio_id,
                        principalTable: "servicios",
                        principalColumn: "id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateIndex(
                name: "IX_habitaciones_nombre",
                table: "habitaciones",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_reserva_servicios_servicio_id",
                table: "reserva_servicios",
                column: "servicio_id");

            migrationBuilder.CreateIndex(
                name: "IX_reservas_estado",
                table: "reservas",
                column: "estado");

            migrationBuilder.CreateIndex(
                name: "IX_reservas_habitacion_fechas",
                table: "reservas",
                columns: new[] { "habitacion_id", "fecha_entrada", "fecha_salida" },
                filter: "estado IN ('Pendiente', 'Confirmada')");

            migrationBuilder.CreateIndex(
                name: "IX_reservas_usuario_id",
                table: "reservas",
                column: "usuario_id");

            migrationBuilder.CreateIndex(
                name: "IX_servicios_nombre",
                table: "servicios",
                column: "nombre",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_usuarios_correo",
                table: "usuarios",
                column: "correo",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "reserva_servicios");

            migrationBuilder.DropTable(
                name: "reservas");

            migrationBuilder.DropTable(
                name: "servicios");

            migrationBuilder.DropTable(
                name: "habitaciones");

            migrationBuilder.DropTable(
                name: "usuarios");
        }
    }
}
