using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Villa7.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStateAuditFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_reservas_estado",
                table: "reservas");

            migrationBuilder.AddColumn<bool>(
                name: "activo",
                table: "usuarios",
                type: "boolean",
                nullable: false,
                defaultValue: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_cambio_estado",
                table: "usuarios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "motivo_cambio_estado",
                table: "usuarios",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "usuario_cambio_estado",
                table: "usuarios",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_cambio_estado",
                table: "servicios",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "motivo_cambio_estado",
                table: "servicios",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "usuario_cambio_estado",
                table: "servicios",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_cambio_estado",
                table: "reservas",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "motivo_cambio_estado",
                table: "reservas",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "usuario_cambio_estado",
                table: "reservas",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "fecha_cambio_estado",
                table: "habitaciones",
                type: "timestamp with time zone",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "motivo_cambio_estado",
                table: "habitaciones",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "usuario_cambio_estado",
                table: "habitaciones",
                type: "character varying(255)",
                maxLength: 255,
                nullable: true);

            migrationBuilder.AddCheckConstraint(
                name: "CK_reservas_estado",
                table: "reservas",
                sql: "estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada', 'Anulada')");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropCheckConstraint(
                name: "CK_reservas_estado",
                table: "reservas");

            migrationBuilder.DropColumn(
                name: "activo",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "fecha_cambio_estado",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "motivo_cambio_estado",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "usuario_cambio_estado",
                table: "usuarios");

            migrationBuilder.DropColumn(
                name: "fecha_cambio_estado",
                table: "servicios");

            migrationBuilder.DropColumn(
                name: "motivo_cambio_estado",
                table: "servicios");

            migrationBuilder.DropColumn(
                name: "usuario_cambio_estado",
                table: "servicios");

            migrationBuilder.DropColumn(
                name: "fecha_cambio_estado",
                table: "reservas");

            migrationBuilder.DropColumn(
                name: "motivo_cambio_estado",
                table: "reservas");

            migrationBuilder.DropColumn(
                name: "usuario_cambio_estado",
                table: "reservas");

            migrationBuilder.DropColumn(
                name: "fecha_cambio_estado",
                table: "habitaciones");

            migrationBuilder.DropColumn(
                name: "motivo_cambio_estado",
                table: "habitaciones");

            migrationBuilder.DropColumn(
                name: "usuario_cambio_estado",
                table: "habitaciones");

            migrationBuilder.AddCheckConstraint(
                name: "CK_reservas_estado",
                table: "reservas",
                sql: "estado IN ('Pendiente', 'Confirmada', 'Cancelada', 'Completada')");
        }
    }
}
