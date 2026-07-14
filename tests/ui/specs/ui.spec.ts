import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

test.describe('Villa7 UI Tests', () => {

  test('1. Home Page load, navigation, and responsiveness', async ({ page }) => {
    // Navigate home
    await page.goto('/');
    await expect(page).toHaveTitle(/frontend|villa7/i);

    // Verify navigation works
    await page.click('text=Habitaciones');
    await expect(page).toHaveURL(/.*habitaciones/);

    // Verify responsive hamburger menu
    await page.setViewportSize({ width: 375, height: 667 });
    const hamburger = page.locator('button:has(svg.lucide-menu)');
    await expect(hamburger).toBeVisible();
    await hamburger.click();
    
    // Check mobile menu drawer is open
    await expect(page.locator('text=Inicio >> visible=true').first()).toBeVisible();
    
    // Restore viewport
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test('2. Authentication validation, errors, registration, and logins', async ({ page }) => {
    // Go to login page
    await page.goto('/login');
    
    // Submit empty form to trigger validation
    await page.click('button:has-text("Iniciar Sesión")');
    await expect(page.locator('text=El correo electrónico es requerido')).toBeVisible();
    await expect(page.locator('text=La contraseña es requerida')).toBeVisible();

    // Invalid email format validation
    await page.fill('input[name="correo"]', 'invalid-email');
    await page.click('button:has-text("Iniciar Sesión")');
    await expect(page.locator('text=El formato del correo electrónico no es válido')).toBeVisible();

    // Server error test
    await page.fill('input[name="correo"]', 'nonexistent@user.com');
    await page.fill('input[name="password"]', 'WrongPassword123');
    await page.click('button:has-text("Iniciar Sesión")');
    await expect(page.locator('text=Request failed with status code 401')).toBeVisible();

    // Go to register page
    await page.click('text=Regístrate aquí');
    await expect(page).toHaveURL(/.*register/);

    // Form validation on registration
    await page.click('button:has-text("Registrarse")');
    await expect(page.locator('text=El nombre debe tener al menos 2 caracteres')).toBeVisible();
    await expect(page.locator('text=El correo electrónico es requerido')).toBeVisible();

    // Valid Client registration
    const uniqueEmail = `playwright-client-${Math.random().toString(36).substring(2, 11)}@test.com`;
    await page.fill('input[name="nombre"]', 'Cliente Playwright');
    await page.fill('input[name="correo"]', uniqueEmail);
    await page.fill('input[name="password"]', 'Password123!');
    await page.click('button:has-text("Registrarse")');

    // Wait for redirection to homepage (authenticated state)
    await page.waitForURL('http://localhost:5173/');
    await expect(page.locator('text=Hola, Cliente Playwright')).toBeVisible();

    // Logout
    await page.click('button:has-text("Salir")');
    await expect(page.locator('text=Iniciar Sesión')).toBeVisible();

    // Login as Admin
    await page.goto('/login');
    await page.fill('input[name="correo"]', 'admin@villa7.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForURL('http://localhost:5173/');
    await expect(page.locator('text=Hola, Administrador de Villa7')).toBeVisible();
  });

  test('3. Rooms catalog display, prices, and room details modal', async ({ page }) => {
    await page.goto('/habitaciones');
    
    // Wait for rooms to load (grid must appear)
    await page.waitForSelector('.grid', { timeout: 10000 });
    
    // Verify prices display in Soles (S/) format — Intl.NumberFormat('es-PE') produces "S/ 120.00"
    const priceText = page.locator('[class*="text-gray"]', { hasText: /S\/\s/ }).first();
    await expect(priceText).toBeVisible();

    // Open detail modal (button text rendered as 'Ver Detalles')
    await page.locator('button:has-text("Ver Detalles")').first().click();
    
    // Verify details inside modal
    const modal = page.locator('div.fixed.inset-0');
    await expect(modal).toBeVisible();
    await expect(modal.locator('text=Capacidad')).toBeVisible();
    await expect(modal.locator('text=Servicios Incluidos').first()).toBeVisible();
    await expect(modal.locator('button:has-text("Reservar Ahora")')).toBeVisible();

    // Close modal
    await modal.locator('button:has-text("Cerrar")').click();
    await expect(modal).not.toBeVisible();
  });

  test('4. Admin control panel: room CRUD, services, reservations and clients view', async ({ page }) => {
    // Login as Admin
    await page.goto('/login');
    await page.fill('input[name="correo"]', 'admin@villa7.com');
    await page.fill('input[name="password"]', 'Admin123');
    await page.click('button:has-text("Iniciar Sesión")');
    await page.waitForURL('http://localhost:5173/');

    // Navigate to admin rooms management page
    await page.click('text=Panel de Control');
    await page.click('text=Habitaciones');
    await expect(page).toHaveURL(/.*admin\/habitaciones/);

    // Create Room
    await page.click('button:has-text("Nueva Cabaña")');
    await expect(page.locator('text=Registrar Nueva Cabaña')).toBeVisible();

    const uniqueRoomName = `Cabaña Playwright ${Math.random().toString(36).substring(2, 7)}`;
    await page.fill('input[name="nombre"]', uniqueRoomName);
    await page.fill('textarea[name="descripcion"]', 'Cabaña de pruebas UI Playwright');
    await page.fill('input[name="ubicacion"]', 'Sector Playwright, Lote 12');
    await page.fill('input[name="capacidadMax"]', '4');
    await page.fill('input[name="precioPorNoche"]', '180.00');
    await page.click('button:has-text("Registrar Cabaña")');

    // Confirm created in table
    const tableRow = page.locator(`tr:has-text("${uniqueRoomName}")`);
    await expect(tableRow).toBeVisible();

    // Edit Room and Image Upload / Deletion
    await tableRow.locator('button[title="Editar"]').click();
    await expect(page.locator('text=Editar Cabaña')).toBeVisible();


    // Upload image
    const tempFilePath = path.join(__dirname, 'temp-ui-image.png');
    fs.writeFileSync(tempFilePath, Buffer.alloc(100)); // Write a mock file
    
    const fileInput = page.locator('input#integrated-image-input');
    await fileInput.setInputFiles(tempFilePath);
    
    // Click upload
    await page.click('button:has-text("Subir")');
    await expect(page.locator('text=¡Imagen cargada correctamente!')).toBeVisible();

    // Delete image (handles confirm dialog automatically by default in Playwright, but let's accept it)
    page.once('dialog', async dialog => {
      await dialog.accept();
    });
    await page.click('button[title="Eliminar Imagen"]');
    await expect(page.locator('text=¡Imagen eliminada correctamente!')).toBeVisible();
    
    // Clean up temp file
    if (fs.existsSync(tempFilePath)) {
      fs.unlinkSync(tempFilePath);
    }

    // Close modal
    await page.click('button:has-text("Cancelar")');

    // Navigate to other admin dashboards
    await page.click('text=Servicios');
    await expect(page).toHaveURL(/.*admin\/servicios/);
    await expect(page.locator('text=Gestionar Servicios Adicionales')).toBeVisible();

    await page.click('text=Reservas');
    await expect(page).toHaveURL(/.*admin\/reservas/);
    await expect(page.locator('text=Gestionar Reservas')).toBeVisible();

    await page.click('text=Clientes');
    await expect(page).toHaveURL(/.*admin\/clientes/);
    await expect(page.locator('h2:has-text("Clientes Registrados")')).toBeVisible();
  });


});
