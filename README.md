# 🏡 Villa7

Sistema Web de Reserva de Habitaciones y Servicios desarrollado con **ASP.NET Core 10**, **React + TypeScript**, **Supabase PostgreSQL** y **Supabase Storage**, siguiendo el enfoque **Spec-Driven Development (SDD)** y una arquitectura basada en **Clean Architecture**.

---

# 📖 Descripción

Villa7 es un sistema web orientado a la gestión integral de reservas de habitaciones y servicios para un establecimiento de hospedaje. El sistema permite administrar habitaciones, clientes, servicios adicionales y reservas, ofreciendo una plataforma moderna tanto para clientes como para administradores.

El proyecto fue desarrollado aplicando el enfoque **Spec-Driven Development (SDD)**, garantizando la trazabilidad entre los requisitos, el diseño, la implementación y las pruebas.

---

# ✨ Características principales

- Gestión de habitaciones.
- Gestión de clientes.
- Gestión de reservas.
- Gestión de servicios adicionales.
- Catálogo público de habitaciones.
- Visualización de detalles de habitaciones.
- Gestión de imágenes mediante Supabase Storage.
- Autenticación y autorización mediante JWT.
- Panel de administración.
- Arquitectura Clean Architecture.
- Integración con Supabase PostgreSQL.
- Desarrollo guiado por especificaciones (SDD).

---

# 🏗 Arquitectura del sistema

El sistema está compuesto por una arquitectura cliente-servidor distribuida.

```text
Frontend (React + TypeScript + Vite)
                │
                ▼
Backend (ASP.NET Core 10 Web API)
                │
                ▼
Entity Framework Core
                │
                ▼
Supabase PostgreSQL
                │
                ▼
Supabase Storage
```

La solución implementa **Clean Architecture**, separando claramente las capas de presentación, aplicación, dominio e infraestructura.

---

# 💻 Tecnologías utilizadas

| Tecnología | Descripción |
|------------|-------------|
| ASP.NET Core 10 | Backend |
| C# | Lenguaje Backend |
| React | Frontend |
| TypeScript | Desarrollo Frontend |
| Vite | Bundler |
| Tailwind CSS | Diseño de interfaz |
| PostgreSQL | Base de datos |
| Supabase | Base de datos y almacenamiento |
| Entity Framework Core | ORM |
| JWT | Autenticación |
| Playwright | Pruebas UI y End-to-End |
| xUnit | Pruebas Unitarias |

---

# 📂 Estructura del proyecto

```text
Villa7/

├── backend/
├── frontend/
├── tests/
│   ├── functional/
│   ├── unit/
│   ├── integration/
│   ├── ui/
│   └── e2e/
│
└── .gitignore
```

---

# ⚙ Instalación

## Clonar el repositorio

```bash
git clone https://github.com/ronexpozo27/Villa7.git
```

## Backend

```bash
cd backend
dotnet restore
dotnet run
```

## Frontend

```bash
cd frontend
npm install
npm run dev
```

---

# 🔐 Variables de entorno

Configurar un archivo `.env` con las siguientes variables:

```env
Supabase__Url=
Supabase__ServiceRoleKey=
ConnectionStrings__DefaultConnection=
Jwt__SecretKey=
Jwt__Issuer=
Jwt__Audience=
```


---

# 👤 Usuarios de prueba

El sistema incluye usuarios iniciales creados mediante el Seed de la base de datos.

| Rol | Usuario |
|------|----------|
| Administrador | admin@villa7.com |
| Cliente | cliente@villa7.com |

---

# 🧪 Pruebas realizadas

El proyecto cuenta con una estrategia integral de aseguramiento de calidad.

- ✅ Pruebas Funcionales
- ✅ Pruebas Unitarias
- ✅ Pruebas de Integración
- ✅ Pruebas de Interfaz de Usuario (UI)
- ✅ Pruebas End-to-End (E2E)

Las evidencias y reportes metodológicos se encuentran documentados en el repositorio **Villa7-Specs**.

---

# 📚 Documentación

La documentación completa del proyecto desarrollada bajo el enfoque **Spec-Driven Development (SDD)** se encuentra en el siguiente repositorio:

👉 **Villa7-Specs**

(Incluir el enlace cuando ambos repositorios estén publicados.)

---

# 🚀 Estado del proyecto

| Fase | Estado |
|------|--------|
| Ingeniería de Requisitos | ✅ |
| Diseño | ✅ |
| Implementación | ✅ |
| Pruebas | ✅ |
| Despliegue | ⏳ En proceso |

---

# 📸 Capturas del sistema

En esta sección se incorporarán capturas de:

- Página principal.
- Catálogo de habitaciones.
- Detalle de habitación.
- Panel de administración.
- Gestión de habitaciones.
- Gestión de reservas.

---

# 📄 Licencia

Este proyecto fue desarrollado con fines académicos como parte del trabajo del curso PRUEBAS Y ASEGURAMIENTO DE CALIDAD DE SOFTWARE [IS - 489] con el obejetivo de desarrollar un app web con enfoque SDD y ademas hacer todas las pruebas de calidad.

---

# 👨‍💻 Autor

**Ronex Pozo**

Escuela Profesional de Ingeniería de Sistemas

Universidad Nacional de San Cristóbal de Huamanga (UNSCH)

Ayacucho – Perú

2026