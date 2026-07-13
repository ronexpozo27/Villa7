using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Villa7.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddImagenUrlAndStoragePathToHabitaciones : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "imagen_storage_path",
                table: "habitaciones",
                type: "character varying(1000)",
                maxLength: 1000,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "imagen_url",
                table: "habitaciones",
                type: "character varying(2048)",
                maxLength: 2048,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "imagen_storage_path",
                table: "habitaciones");

            migrationBuilder.DropColumn(
                name: "imagen_url",
                table: "habitaciones");
        }
    }
}
