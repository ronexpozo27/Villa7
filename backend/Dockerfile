# ==========================
# Etapa de compilación
# ==========================
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build

WORKDIR /src

COPY . .

RUN dotnet restore "API/Villa7.API.csproj"

RUN dotnet publish "API/Villa7.API.csproj" \
    -c Release \
    -o /app/publish \
    /p:UseAppHost=false

# ==========================
# Etapa de ejecución
# ==========================
FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS final

WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000

EXPOSE 10000

ENTRYPOINT ["dotnet", "Villa7.API.dll"]