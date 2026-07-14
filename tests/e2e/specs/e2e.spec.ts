import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Villa7 End-to-End (E2E) Tests', () => {
  const tempImagePath = path.join(__dirname, 'temp-e2e-image.png');

  test.beforeAll(() => {
    // Create a mock image file for upload tests
    fs.writeFileSync(tempImagePath, Buffer.alloc(100));
  });

  test.afterAll(() => {
    // Cleanup mock image file
    if (fs.existsSync(tempImagePath)) {
      try {
        fs.unlinkSync(tempImagePath);
      } catch (e) {
        console.warn('Could not clean up temporary E2E image:', e);
      }
    }
  });

  test('E2E-001: Nuevo Cliente - Carga, Navegación, Registro, Reserva y Mis Reservas', async ({ page }) => {
    // 1. Abrir Home
    await page.goto('/');
    await expect(page).toHaveTitle(/frontend|villa7/i);

    // 2. Navegar al catálogo
    await page.click('text=Habitaciones');
    await expect(page).toHaveURL(/.*habitaciones/);

    // 3. Abrir detalle de habitación (modal)
    await page.click('text=Ver detalles');
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();

    // 4. Intentar reservar redirige a login
    await modal.locator('button:has-text("Reservar ahora")').click();
    await expect(page).toHaveURL(/.*login/);

    // 5. Navegar a Registro
    await page.click('text=Regístrate aquí');
    await expect(page).toHaveURL(/.*register/);

    // 6. Registrarse
    const uniqueEmail = `e2e-client-${Math.random().toString(36).substring(2, 11)}@test.com`;
    await page.fill('input[name="nombre"]', 'Cliente E2E');
    await page.fill('input[name="correo"]', uniqueEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Registrarse")');

    // 7. Redirección y sesión iniciada
    await page.waitForURL('http://localhost:5173/');
    await expect(page.locator('text=Hola, Cliente E2E')).toBeVisible();

    // 8. Crear una reserva
    await page.click('text=Habitaciones');
    await page.click('text=Ver detalles');
    await page.locator('button:has-text("Reservar ahora")').click();
    await page.waitForURL(/.*reservas\/crear.*/);

    // 9. Configurar estadía y fechas usando un offset aleatorio lejano (calculando correctamente el checkout)
    const randomOffset = Math.floor(Math.random() * 100) + 150; // 150 a 250 días en el futuro
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + randomOffset);
    const date1 = futureDate1.toISOString().split('T')[0];

    const futureDate2 = new Date(futureDate1.getTime() + 3 * 24 * 60 * 60 * 1000);
    const date2 = futureDate2.toISOString().split('T')[0];

    await page.fill('#fechaEntrada', date1);
    await page.fill('#fechaSalida', date2);

    // 10. Seleccionar servicios adicionales (si existen)
    const checkbox = page.locator('input[type="checkbox"]').first();
    if (await checkbox.isVisible()) {
      await checkbox.click();
    }

    // 11. Confirmar reserva
    await page.click('button:has-text("Confirmar Reservación")');
    const successModal = page.locator('text=¡Reservación Creada con éxito!');
    await expect(successModal).toBeVisible();

    // 12. Verificar en "Mis Reservas"
    await page.click('button:has-text("Ir a Mis Reservas")');
    await page.waitForURL(/.*mis-reservas/);
    await expect(page.locator('text=Historial y estado de tus solicitudes')).toBeVisible();

    // 13. Cerrar sesión
    await page.click('button:has-text("Salir")');
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();
  });

  test('E2E-002: Administrador - CRUD Completo de Cabañas y Servicios', async ({ page }) => {
    // 1. Iniciar sesión como Administrador
    await page.goto('/login');
    await page.fill('input[name="correo"]', 'admin@villa7.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForURL('http://localhost:5173/');
    await expect(page.locator('text=Hola, Administrador de Villa7')).toBeVisible();

    // 2. Navegar al panel de control de habitaciones
    await page.goto('/admin/habitaciones');
    await expect(page.locator('text=Gestionar Habitaciones')).toBeVisible();

    // 3. Crear cabaña con ubicación
    await page.click('button:has-text("Nueva Cabaña")');
    const uniqueRoomName = `Cabaña E2E ${Math.random().toString(36).substring(2, 7)}`;
    await page.fill('input[name="nombre"]', uniqueRoomName);
    await page.fill('textarea[name="descripcion"]', 'Cabaña de pruebas E2E');
    await page.fill('input[name="ubicacion"]', 'Sector E2E, Lote 99');
    await page.fill('input[name="capacidadMax"]', '6');
    await page.fill('input[name="precioPorNoche"]', '299.99');
    await page.click('button:has-text("Registrar Cabaña")');

    // 4. Confirmar en tabla
    const tableRow = page.locator(`tr:has-text("${uniqueRoomName}")`);
    await expect(tableRow).toBeVisible();

    // 5. Editar ubicación y gestionar imágenes
    await tableRow.locator('button').last().click(); // Clic en editar
    await expect(page.locator('text=Editar Cabaña')).toBeVisible();

    // Modificar ubicación
    await page.fill('input[name="ubicacion"]', 'Sector E2E Modificado, Lote 99');

    // Subir imagen
    const fileInput = page.locator('input#integrated-image-input');
    await fileInput.setInputFiles(tempImagePath);
    await page.click('button:has-text("Subir")');
    await expect(page.locator('text=¡Imagen cargada correctamente!')).toBeVisible();

    // Eliminar imagen
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button[title="Eliminar Imagen"]');
    await expect(page.locator('text=Sin imagen asignada')).toBeVisible();

    // Guardar cambios finales
    await page.click('button:has-text("Guardar Cambios")');

    // 6. Gestionar servicios adicionales
    await page.goto('/admin/servicios');
    await expect(page.locator('text=Gestionar Servicios Adicionales')).toBeVisible();

    // Crear servicio
    await page.click('button:has-text("Nuevo Servicio")');
    const uniqueServiceName = `Servicio E2E ${Math.random().toString(36).substring(2, 7)}`;
    await page.fill('input[name="nombre"]', uniqueServiceName);
    await page.fill('textarea[name="descripcion"]', 'Servicio creado por E2E');
    await page.fill('input[name="precio"]', '45.50');
    await page.click('button:has-text("Registrar Servicio")');

    // Confirmar creación y editar
    const serviceRow = page.locator(`tr:has-text("${uniqueServiceName}")`);
    await expect(serviceRow).toBeVisible();
    await serviceRow.locator('button').last().click(); // Clic en editar
    await expect(page.locator('text=Editar Servicio')).toBeVisible();
    await page.fill('input[name="precio"]', '50.00'); // Modificar precio
    await page.click('button:has-text("Guardar Cambios")');

    // 7. Consultar reservas global
    await page.goto('/admin/reservas');
    await expect(page.locator('text=Gestionar Reservas de Clientes')).toBeVisible();

    // Cerrar sesión
    await page.click('button:has-text("Salir")');
  });

  test('E2E-003: Reserva Inválida - Bloqueo atómico y prevención de traslapes en BD', async ({ page, browser }) => {
    // 1. Iniciar sesión como Admin y crear cabaña exclusiva
    await page.goto('/login');
    await page.fill('input[name="correo"]', 'admin@villa7.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForURL('http://localhost:5173/');

    await page.goto('/admin/habitaciones');
    const roomName = `Cabaña Solape E2E ${Math.random().toString(36).substring(2, 7)}`;
    await page.click('button:has-text("Nueva Cabaña")');
    await page.fill('input[name="nombre"]', roomName);
    await page.fill('textarea[name="descripcion"]', 'Cabaña de pruebas E2E traslapes');
    await page.fill('input[name="ubicacion"]', 'Sector Solapes, Lote 1');
    await page.fill('input[name="capacidadMax"]', '4');
    await page.fill('input[name="precioPorNoche"]', '150.00');
    await page.click('button:has-text("Registrar Cabaña")');

    // Confirmar en tabla y desloguearse
    await expect(page.locator(`tr:has-text("${roomName}")`)).toBeVisible();
    await page.click('button:has-text("Salir")');

    // 2. Iniciar sesión/Registrar Cliente A
    await page.goto('/login');
    const emailA = `e2e-user-a-${Math.random().toString(36).substring(2, 7)}@test.com`;
    await page.click('text=Regístrate aquí');
    await page.fill('input[name="nombre"]', 'Cliente A');
    await page.fill('input[name="correo"]', emailA);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Registrarse")');
    await page.waitForURL('http://localhost:5173/');

    // Buscar la nueva habitación en el catálogo
    await page.click('text=Habitaciones');
    const targetCard = page.locator(`div.glass-card:has-text("${roomName}")`);
    await expect(targetCard).toBeVisible();
    await targetCard.locator('text=Ver detalles').click();

    const modal = page.locator('div.fixed.inset-0');
    await modal.locator('button:has-text("Reservar ahora")').click();
    await page.waitForURL(/.*reservas\/crear.*/);

    // Obtener roomId de la URL
    const url = page.url();
    const roomId = url.split('/').pop()?.split('?')[0] || '';

    // Fechas de reserva (dentro de 10 días, asegurando sin traslape anterior y cálculo correcto)
    const futureDate1 = new Date();
    futureDate1.setDate(futureDate1.getDate() + 10);
    const date1 = futureDate1.toISOString().split('T')[0];

    const futureDate2 = new Date(futureDate1.getTime() + 2 * 24 * 60 * 60 * 1000);
    const date2 = futureDate2.toISOString().split('T')[0];

    // Llenar fechas y confirmar
    await page.fill('#fechaEntrada', date1);
    await page.fill('#fechaSalida', date2);

    await page.click('button:has-text("Confirmar Reservación")');
    await expect(page.locator('text=¡Reservación Creada con éxito!')).toBeVisible();
    await page.click('button:has-text("Ir a Mis Reservas")');

    // Cerrar sesión Cliente A
    await page.click('button:has-text("Salir")');

    // 3. Abrir nuevo contexto del navegador para Cliente B (Sesión aislada)
    const contextB = await browser.newContext();
    const pageB = await contextB.newPage();

    // Registrar e iniciar sesión como Cliente B
    await pageB.goto('/login');
    const emailB = `e2e-user-b-${Math.random().toString(36).substring(2, 7)}@test.com`;
    await pageB.click('text=Regístrate aquí');
    await pageB.fill('input[name="nombre"]', 'Cliente B');
    await pageB.fill('input[name="correo"]', emailB);
    await pageB.fill('input[name="password"]', 'Password123!');
    await pageB.click('button:has-text("Registrarse")');
    await pageB.waitForURL('http://localhost:5173/');

    // Intentar reservar la MISMA habitación en el MISMO rango de fechas
    await pageB.goto(`/reservas/crear/${roomId}`);
    await pageB.fill('#fechaEntrada', date1);
    await pageB.fill('#fechaSalida', date2);

    await pageB.click('button:has-text("Confirmar Reservación")');

    // Verificar que el Backend rechaza y el Frontend muestra el error de disponibilidad
    await expect(pageB.locator('text=no se encuentra disponible')).toBeVisible();

    // Cerrar sesión Cliente B y limpiar contexto
    await pageB.click('button:has-text("Salir")');
    await contextB.close();

    // 4. Confirmar en panel de administración que no existe una reserva duplicada
    await page.goto('/login');
    await page.fill('input[name="correo"]', 'admin@villa7.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForURL('http://localhost:5173/');

    await page.goto('/admin/reservas');
    await page.selectOption('select', 'Pendiente');

    // Contar las reservas que pertenecen al Cliente B para esta habitación
    const clientBRows = page.locator(`tr:has-text("Cliente B")`).locator(`text="${roomName}"`);
    await expect(clientBRows).toHaveCount(0);
    
    // Cerrar sesión del administrador
    await page.click('button:has-text("Salir")');
  });

  test('E2E-004: Gestión de Imágenes - Ciclo de Vida Completo con Supabase Storage', async ({ page }) => {
    // 1. Iniciar sesión como Admin
    await page.goto('/login');
    await page.fill('input[name="correo"]', 'admin@villa7.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForURL('http://localhost:5173/');

    // 2. Ir a administración de habitaciones y crear una cabaña
    await page.goto('/admin/habitaciones');
    await page.click('button:has-text("Nueva Cabaña")');
    const roomName = `Cabaña Img E2E ${Math.random().toString(36).substring(2, 7)}`;
    await page.fill('input[name="nombre"]', roomName);
    await page.fill('textarea[name="descripcion"]', 'Cabaña para probar ciclo de imágenes');
    await page.fill('input[name="ubicacion"]', 'Ubicación Img Test');
    await page.fill('input[name="capacidadMax"]', '2');
    await page.fill('input[name="precioPorNoche"]', '120.00');
    await page.click('button:has-text("Registrar Cabaña")');

    // 3. Subir Imagen
    const row = page.locator(`tr:has-text("${roomName}")`);
    await expect(row).toBeVisible();
    await row.locator('button').last().click(); // Clic en editar

    const fileInput = page.locator('input#integrated-image-input');
    await fileInput.setInputFiles(tempImagePath);
    await page.click('button:has-text("Subir")');
    await expect(page.locator('text=¡Imagen cargada correctamente!')).toBeVisible();

    // 4. Verificar visualización inmediata (Preview src contiene la URL de Supabase)
    const imgPreview = page.locator('div.h-32 img');
    await expect(imgPreview).toBeVisible();
    const imgSrc = await imgPreview.getAttribute('src');
    expect(imgSrc).not.toBeNull();
    // Debe ser una URL pública de Supabase
    expect(imgSrc).toContain('supabase.co/storage/v1/object/public/');

    // Guardar cambios
    await page.click('button:has-text("Guardar Cambios")');

    // 5. Confirmar persistencia volviendo a abrir la edición
    await row.locator('button').last().click();
    const imgReloaded = page.locator('div.h-32 img');
    await expect(imgReloaded).toBeVisible();
    const reloadedSrc = await imgReloaded.getAttribute('src');
    expect(reloadedSrc).toBe(imgSrc); // Debe ser el mismo
    await page.click('button:has-text("Cancelar")'); // Cerrar modal

    // 6. Verificar renderizado en el catálogo público
    await page.goto('/habitaciones');
    const catalogCard = page.locator(`div.glass-card:has-text("${roomName}")`);
    await expect(catalogCard).toBeVisible();
    const cardImg = catalogCard.locator('img');
    await expect(cardImg).toBeVisible();
    const cardImgSrc = await cardImg.getAttribute('src');
    expect(cardImgSrc).toBe(imgSrc);

    // 7. Reemplazar imagen
    await page.goto('/admin/habitaciones');
    await row.locator('button').last().click();
    // Subir de nuevo el mismo archivo simulado (lo reemplaza)
    await fileInput.setInputFiles(tempImagePath);
    await page.click('button:has-text("Subir")');
    await expect(page.locator('text=¡Imagen cargada correctamente!')).toBeVisible();
    await page.click('button:has-text("Guardar Cambios")');

    // 8. Eliminar imagen y confirmar sincronización completa
    await row.locator('button').last().click();
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button[title="Eliminar Imagen"]');
    await expect(page.locator('text=Sin imagen asignada')).toBeVisible();
    await page.click('button:has-text("Guardar Cambios")');

    // Confirmar en catálogo público que ya no tiene la imagen (renderiza el placeholder/icono)
    await page.goto('/habitaciones');
    const catalogCardFinal = page.locator(`div.glass-card:has-text("${roomName}")`);
    await expect(catalogCardFinal).toBeVisible();
    // No debe haber un tag <img> en la card si no tiene imagen asignada
    await expect(catalogCardFinal.locator('img')).toHaveCount(0);

    // Cerrar sesión final
    await page.click('button:has-text("Salir")');
  });
});
