import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Backend simulado para controlar latencia y fallos sin tocar cuentas reales.
async function editorFixture(page: Page, initialStatus = 'active') {
  let workspaceStatus = initialStatus;
  const uid = '22222222-0000-4000-8000-000000000001';
  const timestamp = '2026-09-19T00:00:00+00:00';
  const wardrobe = {
    id: 1,
    user_id: uid,
    name: 'Armario de prueba',
    room: '',
    description: '',
    position_x: 0,
    position_y: 0,
    width: 800,
    height: 600,
    z_index: 0,
    created_at: timestamp,
    updated_at: timestamp,
  };
  type TestZone = {
    id: number;
    user_id: string;
    wardrobe_id: number;
    name: string;
    type: string;
    color: string;
    position_x: number;
    position_y: number;
    width: number;
    height: number;
    z_index: number;
    created_at: string;
    updated_at: string;
  };
  let zones: TestZone[] = [
    {
      id: 1,
      user_id: uid,
      wardrobe_id: 1,
      name: 'Balda',
      type: 'shelf',
      color: '#D9D6CF',
      position_x: 32,
      position_y: 32,
      width: 240,
      height: 200,
      z_index: 0,
      created_at: timestamp,
      updated_at: timestamp,
    },
  ];
  let id = 1;
  let pause: Promise<void> | null = null;
  let reject = false;
  let requests = 0;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  const token = [
    'e30',
    Buffer.from(JSON.stringify({ sub: uid, exp: 4102444800 })).toString('base64url'),
    'signature',
  ].join('.');
  await page.addInitScript(
    (session) => localStorage.setItem('outify-outify_dev-session', JSON.stringify(session)),
    {
      access_token: token,
      refresh_token: 'test-only',
      expires_at: 4102444800,
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: uid,
        aud: 'authenticated',
        email: 'outify-test@example.invalid',
        user_metadata: {},
        app_metadata: {},
        created_at: timestamp,
      },
    },
  );
  await page.route('https://zckqbrwdgxohdymiwbfz.supabase.co/**', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const table = url.pathname.split('/').pop();
    let data: unknown = [];
    if (table === 'initialize_user_workspace') data = null;
    if (table === 'get_workspace_status') data = workspaceStatus;
    if (table === 'activate_workspace') {
      workspaceStatus = 'active';
      data = null;
    }
    if (table === 'wardrobes')
      data =
        request.method() === 'GET' ? [wardrobe] : Object.assign(wardrobe, request.postDataJSON());
    if (table === 'zones') {
      if (request.method() === 'PATCH') {
        requests++;
        if (pause) await pause;
        if (reject) {
          await route.fulfill({ status: 500, json: { message: 'Error de guardado simulado' } });
          return;
        }
        const zoneId = Number(url.searchParams.get('id')?.replace('eq.', ''));
        zones = zones.map((z) => (z.id === zoneId ? { ...z, ...request.postDataJSON() } : z));
        data = zones.find((z) => z.id === zoneId);
      } else if (request.method() === 'POST') {
        const next = { ...zones[0], id: ++id, ...request.postDataJSON() };
        zones.push(next);
        data = next;
      } else data = zones;
    }
    if (table === 'restore_zone_state') {
      if (reject) {
        await route.fulfill({ status: 409, json: { message: 'Conflicto simulado de historial' } });
        return;
      }
      const body = request.postDataJSON();
      zones = zones.filter((z) => z.id !== body.target_id);
      if (body.restored_state) zones.push(body.restored_state);
      data = body.restored_state;
    }
    await route.fulfill({ json: data });
  });
  return {
    setStatus(status: string) {
      workspaceStatus = status;
    },
    errors,
    get requests() {
      return requests;
    },
    hold() {
      let release!: () => void;
      pause = new Promise<void>((resolve) => {
        release = resolve;
      });
      return () => {
        pause = null;
        release();
      };
    },
    fail(value = true) {
      reject = value;
    },
  };
}

async function openEditor(page: Page) {
  await page.goto('/wardrobes');
  await page.getByRole('button', { name: 'Editar armarios' }).click();
  await page.getByRole('button', { name: 'Balda, 0 artículos' }).click();
}

test('soltar conserva el destino durante el guardado y un fallo restaura la posición', async ({
  page,
}) => {
  const backend = await editorFixture(page);
  await openEditor(page);
  const zone = page.locator('[data-zone="1"]');
  const start = await zone.getAttribute('transform');
  const release = backend.hold();
  const bounds = await page.locator('[data-zone="1"] .zone-background').boundingBox();
  await page.mouse.move(bounds!.x + 40, bounds!.y + 60);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + 120, bounds!.y + 110, { steps: 5 });
  await expect(zone).not.toHaveAttribute('transform', start!);
  const destination = await zone.getAttribute('transform');
  await page.mouse.up();
  await expect.poll(() => backend.requests).toBe(1);
  await expect(zone).toHaveAttribute('transform', destination!);
  release();
  await expect(page.getByText('Todo guardado')).toBeVisible();
  backend.fail();
  await page.locator('[data-zone="1"] .zone-background').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByRole('alert')).toContainText('Error de guardado simulado');
  await expect(zone).toHaveAttribute('transform', destination!);
  expect(backend.errors).toEqual([]);
});

test('historial ordenado de movimientos, altas, propiedades y bajas, sin perder redo', async ({
  page,
}) => {
  await editorFixture(page);
  await openEditor(page);
  await page.locator('[data-zone="1"] .zone-background').focus();
  await page.keyboard.press('ArrowRight');
  await expect(page.getByLabel('X', { exact: true })).toHaveValue('40');
  await expect(page.getByText('Todo guardado')).toBeVisible();
  await page.getByRole('button', { name: '+ Zona', exact: true }).click();
  await expect(page.locator('[data-zone]')).toHaveCount(2);
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.locator('[data-zone]')).toHaveCount(1);
  await expect(page.locator('[data-zone="1"]')).toHaveAttribute('transform', 'translate(40 32)');
  await page.getByRole('button', { name: 'Rehacer', exact: true }).click();
  await expect(page.locator('[data-zone]')).toHaveCount(2);
  await page.getByLabel('Nombre *', { exact: true }).last().fill('Cajón favorito');
  await page.getByLabel('Nombre *', { exact: true }).last().press('Tab');
  await expect(page.getByRole('button', { name: 'Cajón favorito, 0 artículos' })).toBeVisible();
  await expect(page.getByText('Todo guardado')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar zona', exact: true }).click();
  await expect(page.locator('[data-zone]')).toHaveCount(1);
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cajón favorito, 0 artículos' })).toBeVisible();
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Nueva zona, 0 artículos' })).toBeVisible();
  await page.getByRole('button', { name: 'Rehacer', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Cajón favorito, 0 artículos' })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'tmp/editor-verified.png' });
});

test('snap activado, Mayús libre y toggle disponible en móvil', async ({ page }) => {
  await editorFixture(page);
  await openEditor(page);
  const snap = page.getByRole('button', { name: 'Snap activado' });
  await expect(snap).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-zone="1"] .zone-background').scrollIntoViewIfNeeded();
  await page.keyboard.down('Shift');
  const bounds = await page.locator('[data-zone="1"] .zone-background').boundingBox();
  await page.mouse.move(bounds!.x + 40, bounds!.y + 60);
  await page.mouse.down();
  await page.mouse.move(bounds!.x + 57, bounds!.y + 71, { steps: 3 });
  await page.mouse.up();
  await page.keyboard.up('Shift');
  await expect(page.getByText('Todo guardado')).toBeVisible();
  await expect
    .poll(async () => Number(await page.getByLabel('X', { exact: true }).inputValue()) % 8)
    .not.toBe(0);
  await page.setViewportSize({ width: 390, height: 844 });
  await snap.click();
  await expect(page.getByRole('button', { name: 'Snap desactivado' })).toHaveAttribute(
    'aria-pressed',
    'false',
  );
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'tmp/editor-mobile-verified.png', fullPage: true });
});

test('un fallo al deshacer conserva la zona y la pila para reintentar', async ({ page }) => {
  const backend = await editorFixture(page);
  await openEditor(page);
  await page.getByRole('button', { name: '+ Zona', exact: true }).click();
  await expect(page.locator('[data-zone]')).toHaveCount(2);
  backend.fail();
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Conflicto simulado de historial');
  await expect(page.locator('[data-zone]')).toHaveCount(2);
  await expect(page.getByRole('button', { name: 'Deshacer', exact: true })).toBeEnabled();
  await expect(page.getByRole('button', { name: 'Rehacer', exact: true })).toBeDisabled();
  backend.fail(false);
  await page.getByRole('button', { name: 'Deshacer', exact: true }).click();
  await expect(page.locator('[data-zone]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: 'Rehacer', exact: true })).toBeEnabled();
});

test('menú con backdrop, cierre exterior, Escape, foco y rutas heredadas', async ({ page }) => {
  await editorFixture(page);
  await page.goto('/articulos?zona=1');
  await expect(page).toHaveURL(/\/items\?zone=1$/);
  const trigger = page.getByRole('button', { name: 'Más filtros' });
  await trigger.click();
  await expect(trigger).toHaveAttribute('aria-expanded', 'true');
  await page.getByLabel('Etiqueta', { exact: true }).fill('lino');
  await page.keyboard.press('Escape');
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await trigger.click();
  await expect(page.getByLabel('Etiqueta', { exact: true })).toHaveValue('lino');
  await page.locator('.popover-backdrop').click({ position: { x: 5, y: 5 } });
  await expect(trigger).toHaveAttribute('aria-expanded', 'false');
  await page.setViewportSize({ width: 390, height: 844 });
  await trigger.click();
  await expect(page.getByLabel('Etiqueta', { exact: true })).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'tmp/filters-mobile-verified.png', fullPage: true });
  await page.keyboard.press('Escape');
  await page.goto('/armarios?armario=1');
  await expect(page).toHaveURL(/\/wardrobes\?wardrobe=1$/);
});

test('acceso requiere declarar 14 años antes de OAuth y al abrir un perfil antiguo', async ({
  page,
}) => {
  await page.goto('/login');
  await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Confirmo que tengo al menos 14 años.' }).check();
  await expect(page.getByRole('button', { name: 'Continuar con Google' })).toBeEnabled();
  const backend = await editorFixture(page, 'age_required');
  await page.goto('/wardrobes');
  await expect(page.getByRole('heading', { name: 'Antes de abrir tu espacio' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Abrir mi espacio', exact: true })).toBeDisabled();
  await page.getByRole('checkbox', { name: 'Confirmo que tengo al menos 14 años.' }).check();
  await page.getByRole('button', { name: 'Abrir mi espacio', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Editar armarios' })).toBeVisible();
  expect(backend.errors).toEqual([]);
});

test('baja: confirmación, cierre del inventario, estado persistente y accesibilidad móvil', async ({
  page,
}) => {
  const backend = await editorFixture(page);
  let requests = 0;
  await page.route('**/api/account-deletion', async (route) => {
    requests++;
    expect(route.request().postDataJSON()).toEqual({ confirmation: 'ELIMINAR' });
    backend.setStatus('pending');
    await route.fulfill({ status: 202, json: { status: 'pending' } });
  });
  await page.goto('/account');
  await page.getByRole('button', { name: 'Eliminar mis datos', exact: true }).click();
  const confirm = page.getByRole('button', { name: 'Eliminar definitivamente' });
  await expect(confirm).toBeDisabled();
  await page.getByLabel('Escribe ELIMINAR para confirmar').fill('ELIMINAR');
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'tmp/account-deletion-mobile.png', fullPage: true });
  await confirm.click();
  await expect(page.getByRole('heading', { name: 'Estamos eliminando tus datos' })).toBeVisible();
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Estamos eliminando tus datos' })).toBeVisible();
  expect(requests).toBe(1);
  backend.setStatus('deleted');
  await page.getByRole('button', { name: 'Comprobar estado' }).click();
  await expect(
    page.getByRole('heading', { name: 'Tus datos de Outify se han eliminado' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Crear un espacio nuevo' })).toBeDisabled();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  expect(backend.errors).toEqual([]);
});

test('respuesta perdida tras registrar la baja recupera el estado sin reabrir datos', async ({
  page,
}) => {
  const backend = await editorFixture(page);
  await page.route('**/api/account-deletion', async (route) => {
    backend.setStatus('pending');
    await route.abort('failed');
  });
  await page.goto('/account');
  await page.getByRole('button', { name: 'Eliminar mis datos', exact: true }).click();
  await page.getByLabel('Escribe ELIMINAR para confirmar').fill('ELIMINAR');
  await page.getByRole('button', { name: 'Eliminar definitivamente' }).click();
  await expect(page.getByRole('heading', { name: 'Estamos eliminando tus datos' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Eliminar definitivamente' })).toHaveCount(0);
});
