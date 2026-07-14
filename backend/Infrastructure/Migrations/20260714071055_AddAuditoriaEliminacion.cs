using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Villa7.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditoriaEliminacion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "auditoria_eliminaciones",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false),
                    fecha = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    administrador = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    entidad = table.Column<string>(type: "character varying(50)", maxLength: 50, nullable: false),
                    entidad_id = table.Column<Guid>(type: "uuid", nullable: false),
                    nombre = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    ip = table.Column<string>(type: "character varying(45)", maxLength: 45, nullable: true),
                    motivo = table.Column<string>(type: "character varying(1000)", maxLength: 1000, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_auditoria_eliminaciones", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "auditoria_eliminaciones");
        }
    }
}
