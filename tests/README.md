# Villa7 — Estructura y Planificación de Pruebas del Sistema (Fase 4)

Este directorio contiene toda la suite de pruebas del sistema web de reserva de habitaciones y servicios **Villa7**, organizado de manera profesional y estructurada para garantizar la escalabilidad, la separación de responsabilidades y la trazabilidad del enfoque **Spec-Driven Development (SDD)**.

---

## 📁 Estructura del Directorio de Pruebas

```
tests/
├── functional/         # Pruebas funcionales de extremo a extremo de la API
│   ├── test-cases/     # Scripts y casos de prueba automatizados
│   ├── evidence/       # Capturas, logs de red y evidencias físicas de ejecución
│   └── reports/        # Historial de reportes consolidados y JSONs de resultados
├── unit/               # Pruebas unitarias de lógica y validaciones aisladas
├── integration/        # Pruebas de integración del backend y base de datos
├── ui/                 # Pruebas de renderizado y comportamiento de componentes frontend
└── e2e/                # Pruebas End-to-End simulando navegación del cliente
```

---

## 🧪 Detalle de Subcarpetas y Propósitos

### 1. `functional/` (Pruebas Funcionales)
*   **Propósito:** Validar que los flujos lógicos de negocio implementados (Autenticación, Habitaciones, Servicios, Reservas y Clientes) funcionen correctamente en el sistema real contra la base de datos Supabase PostgreSQL y el almacenamiento de Supabase Storage.
*   **Contenido:**
    *   `test-cases/`: Contiene el script automatizado principal `run-tests.js` que simula flujos interactivos de peticiones HTTP.
    *   `evidence/`: Almacena logs de ejecución y peticiones HTTP.
    *   `reports/`: Reportes de compilación y ejecución local.

### 2. `unit/` (Pruebas Unitarias - Fase 4.2)
*   **Propósito:** Probar de manera aislada la lógica pura del negocio (validaciones de reglas de negocio, cifrado, formateo, esquemas Zod y controladores sin dependencias externas) utilizando frameworks como `xUnit` en el Backend y `Vitest` en el Frontend.
*   **Casos de Uso:** Comprobación del formateador de soles, validación de capacidad de huéspedes, hashes de contraseñas.

### 3. `integration/` (Pruebas de Integración - Fase 4.3)
*   **Propósito:** Verificar el correcto acoplamiento de las capas lógicas del Backend con la base de datos Supabase PostgreSQL mediante pruebas de base de datos en memoria o bases de datos aisladas de pruebas.
*   **Casos de Uso:** Mapeos de EF Core, verificación de exclusión transaccional y rollback de imágenes huérfanas en el Storage.

### 4. `ui/` (Pruebas de Interfaz - Fase 4.4)
*   **Propósito:** Certificar el comportamiento de la interfaz de usuario, el ciclo de vida de los componentes React y la interacción con el usuario simulando eventos DOM.
*   **Casos de Uso:** Apertura de modales, comportamiento del panel Drag & Drop de carga de imágenes, validaciones en tiempo real de formularios de reservas.

### 5. `e2e/` (Pruebas End-to-End - Fase 4.5)
*   **Propósito:** Ejecutar flujos automatizados simulando la navegación de un usuario final sobre el navegador web real con herramientas como `Playwright` o `Cypress`.
*   **Casos de Uso:** Flujo de registro, logueo, selección de fechas en catálogo, reservación con cálculo total automático de costos y visualización en el panel administrativo.

---

## 🚀 Ejecución de Pruebas Funcionales

Para ejecutar la batería de pruebas funcionales automatizadas desde la raíz del proyecto, ejecute el comando:

```bash
node tests/functional/test-cases/run-tests.js
```
