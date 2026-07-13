using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Villa7.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddUbicacionToHabitaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ubicacion",
                table: "habitaciones",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ubicacion",
                table: "habitaciones");
        }
    }
}
