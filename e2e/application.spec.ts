import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'node:fs';

test('inventario, editor, persistencia, archivado, imágenes y accesibilidad', async ({ page }) => {
  const credentials = JSON.parse(readFileSync('tmp/test-account.json', 'utf8')) as {
    email: string;
    password: string;
  };
  const client = createClient(
    'https://zckqbrwdgxohdymiwbfz.supabase.co',
    'sb_publishable_4Km0kzBpB6C3LJDDjO3cbg_V9vKSvod',
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
  const login = await client.auth.signInWithPassword(credentials);
  expect(login.error).toBeNull();
  expect(login.data.session).toBeTruthy();
  expect(credentials.email).toMatch(/^outify-test-/);
  const db = client.schema('outify_dev');
  const previous = await db.from('items').select('id');
  for (const row of previous.data ?? []) {
    expect(
      (await db.from('items').update({ status: 'archived' }).eq('id', row.id)).error,
    ).toBeNull();
    expect((await db.rpc('delete_archived_item', { item: row.id })).error).toBeNull();
  }
  await page.addInitScript(
    (session) => localStorage.setItem('outify-outify_dev-session', JSON.stringify(session)),
    login.data.session,
  );
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/armarios');
  await expect(page.getByRole('heading', { name: 'Mi armario', exact: true })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Para colgar, 0 artículos' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('link', { name: '+ Crear artículo' }).click();
  await page.getByLabel('Nombre *', { exact: true }).fill('Camisa de prueba');
  await page.getByLabel('Imagen principal').setInputFiles({
    name: 'camisa.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByLabel('Marca', { exact: true }).fill('Atelier');
  await page.getByLabel('Verano', { exact: true }).check();
  await page.getByLabel('Etiquetas').fill('Lino, favorita');
  await page
    .getByRole('combobox', { name: 'Armario', exact: true })
    .selectOption({ label: 'Mi armario' });
  await page
    .getByRole('combobox', { name: 'Zona', exact: true })
    .selectOption({ label: 'Para colgar' });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Crear artículo', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Camisa de prueba' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Camisa de prueba' })).toBeVisible();
  await expect(page.getByText('Mi armario → Para colgar')).toBeVisible();
  await page.getByLabel('Buscar', { exact: true }).fill('inexistente');
  await expect(page.getByText('Nada por aquí con estos filtros')).toBeVisible();
  await page.getByRole('button', { name: 'Limpiar filtros' }).click();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('heading', { name: 'Camisa de prueba' }).click();
  await page.getByLabel('Imagen principal').setInputFiles({
    name: 'camisa-nueva.png',
    mimeType: 'image/png',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aD1sAAAAASUVORK5CYII=',
      'base64',
    ),
  });
  await page.getByRole('button', { name: 'Guardar cambios', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Camisa de prueba' })).toBeVisible();
  await expect
    .poll(async () => {
      const objects = await client.storage.from('outify-dev-item-images').list(login.data.user!.id);
      return objects.data?.length;
    })
    .toBe(1);
  await page.getByRole('link', { name: 'Armarios', exact: true }).click();
  await page.getByRole('button', { name: 'Editar armarios' }).click();
  await page.getByRole('button', { name: '+ Zona', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nueva zona, 0 artículos' })).toBeVisible();
  await page.getByRole('button', { name: 'Nueva zona, 0 artículos' }).focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('X', { exact: true })).toHaveValue('40');
  const zoneRect = page.getByRole('button', { name: 'Nueva zona, 0 artículos' });
  const bounds = await zoneRect.boundingBox();
  expect(bounds).toBeTruthy();
  await page.mouse.move(bounds!.x + 70, bounds!.y + 70);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + 110, bounds!.y + 90, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await page.getByLabel('X', { exact: true }).inputValue()))
    .toBeGreaterThan(40);
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.getByLabel('X', { exact: true })).toHaveValue('40');
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.getByLabel('X', { exact: true })).toHaveValue('32');
  await page.getByRole('button', { name: 'Rehacer', exact: true }).click();
  await expect(page.getByLabel('X', { exact: true })).toHaveValue('40');
  const handle = await page.locator('.resize-handle').boundingBox();
  await page.mouse.move(handle!.x + 14, handle!.y + 14);
  await page.mouse.down();
  await page.mouse.move(handle!.x + 50, handle!.y + 50, { steps: 8 });
  await page.mouse.up();
  await expect
    .poll(async () => Number(await page.getByLabel('Ancho', { exact: true }).last().inputValue()))
    .toBeGreaterThan(240);
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.getByLabel('Ancho', { exact: true }).last()).toHaveValue('240');
  const initialViewBox = await page.locator('svg.wardrobe-svg').getAttribute('viewBox');
  await page.getByRole('button', { name: 'Acercar', exact: true }).click();
  expect(await page.locator('svg.wardrobe-svg').getAttribute('viewBox')).not.toBe(initialViewBox);
  await page.getByRole('button', { name: 'Ajustar', exact: true }).click();
  await page.screenshot({ path: 'tmp/editor-desktop.png', fullPage: true });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar zona', exact: true }).click();
  await page.getByRole('button', { name: 'Terminar edición' }).click();
  const firstZone = page.getByRole('button', { name: 'Para colgar, 1 artículos' });
  const secondZone = page.getByRole('button', { name: 'Doblado y a mano, 0 artículos' });
  const garment = page.getByRole('button', { name: 'Camisa de prueba. Abrir ficha' });
  const imageBounds = await garment.boundingBox();
  const destination = await secondZone.boundingBox();
  await page.mouse.move(imageBounds!.x + 20, imageBounds!.y + 20);
  await page.mouse.down();
  await page.mouse.move(destination!.x + 70, destination!.y + 100, { steps: 12 });
  await page.mouse.up();
  await expect(page.getByRole('button', { name: 'Doblado y a mano, 1 artículos' })).toBeVisible();
  const movedImage = await garment.boundingBox();
  const origin = await page.getByRole('button', { name: 'Para colgar, 0 artículos' }).boundingBox();
  await page.mouse.move(movedImage!.x + 20, movedImage!.y + 20);
  await page.mouse.down();
  await page.mouse.move(origin!.x + 70, origin!.y + 100, { steps: 12 });
  await page.mouse.up();
  await expect(firstZone).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Para colgar, 1 artículos' }).click();
  await page.getByLabel('Ubicación de Camisa de prueba').selectOption('');
  await expect(page.getByText('Artículo sin asignar.', { exact: false })).toBeVisible();
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await page.getByRole('link', { name: 'Artículos', exact: true }).click();
  await page.getByRole('heading', { name: 'Camisa de prueba' }).click();
  await page.getByRole('button', { name: 'Archivar artículo', exact: true }).click();
  await page.getByRole('button', { name: 'Archivados', exact: true }).click();
  await page.getByRole('heading', { name: 'Camisa de prueba' }).click();
  await page.getByRole('button', { name: 'Restaurar sin asignar', exact: true }).click();
  await expect(page).toHaveURL(/\/articulos$/);
  await expect(
    page.locator('.item-caption').getByText('Sin asignar', { exact: true }),
  ).toBeVisible();
  await page.getByRole('heading', { name: 'Camisa de prueba' }).click();
  await page.getByRole('button', { name: 'Archivar artículo', exact: true }).click();
  await page.getByRole('button', { name: 'Archivados', exact: true }).click();
  await page.getByRole('heading', { name: 'Camisa de prueba' }).click();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar definitivamente', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Tu colección empieza con una prenda' }),
  ).toBeVisible();
  const objects = await client.storage.from('outify-dev-item-images').list(login.data.user!.id);
  expect(objects.error).toBeNull();
  expect(objects.data).toHaveLength(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/armarios');
  await expect(page.getByRole('heading', { name: 'Mi armario', exact: true })).toBeVisible();
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'tmp/wardrobe-mobile.png', fullPage: true });
  await page.getByRole('link', { name: 'Mi cuenta' }).click();
  await expect(page.getByRole('heading', { name: 'Pruebas Outify' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Cerrar sesión', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeVisible();
  expect(errors).toEqual([]);
  await client.auth.signOut();
});

test('acceso accesible y adaptable sin sesión', async ({ page }) => {
  await page.goto('/acceso');
  await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
  ).toBeTruthy();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
});
