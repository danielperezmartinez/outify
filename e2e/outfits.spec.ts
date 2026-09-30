import { test, expect, Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

// Backend simulado: las invariantes y permisos reales se verifican en outfits.sql.
async function fixture(page: Page) {
  const uid = '33333333-0000-4000-8000-000000000001';
  const timestamp = '2026-09-30T00:00:00Z';
  const base = { user_id: uid, created_at: timestamp, updated_at: timestamp };
  const items = Array.from({ length: 6 }, (_, index) => ({
    ...base,
    id: index + 1,
    name: 'Prenda ' + (index + 1),
    category: index === 1 ? 'bottom' : 'top',
    description: '',
    primary_color: '',
    brand: '',
    size_label: '',
    material: '',
    seasons: [],
    status: 'active',
    image_path: uid + '/' + index + '.png',
    item_locations: index === 2 ? [] : [{ zone_id: 1 }],
    item_tags: [],
  }));
  type Outfit = typeof base & { id: number; name: string; notes: string; is_favorite: boolean };
  type Entry = {
    id: number;
    outfit_id: number;
    user_id: string;
    item_id: number | null;
    deleted_name: string | null;
    position: number;
  };
  let outfits: Outfit[] = [];
  let entries: Entry[] = [];
  let nextId = 0;
  let nextEntry = 0;
  let failSave = false;
  let failLoad = false;
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
        email: 'outfits@example.invalid',
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
    const method = request.method();
    let data: unknown = [];
    if (table === 'get_workspace_status') data = 'active';
    else if (table === 'initialize_user_workspace') data = null;
    else if (table === 'wardrobes')
      data = [
        {
          ...base,
          id: 1,
          name: 'Dormitorio',
          room: '',
          description: '',
          width: 800,
          height: 600,
          position_x: 0,
          position_y: 0,
          z_index: 0,
        },
      ];
    else if (table === 'zones')
      data = [
        {
          ...base,
          id: 1,
          wardrobe_id: 1,
          name: 'Balda',
          type: 'shelf',
          color: '#DEE7D8',
          position_x: 0,
          position_y: 0,
          width: 240,
          height: 240,
          z_index: 0,
        },
      ];
    else if (table === 'items') data = items;
    else if (method === 'POST' && url.pathname.includes('/storage/v1/object/sign/')) {
      data = (request.postDataJSON().paths as string[]).map((path) => ({
        path,
        signedURL: '/object/sign/test/' + path,
      }));
    } else if (table === 'outfits') {
      if (failLoad)
        return route.fulfill({ status: 500, json: { message: 'No se pudo cargar. Reintenta.' } });
      const id = Number(url.searchParams.get('id')?.replace('eq.', ''));
      if (method === 'PATCH') {
        const outfit = outfits.find((row) => row.id === id)!;
        Object.assign(outfit, request.postDataJSON());
        data = outfit;
      } else if (method === 'DELETE') {
        outfits = outfits.filter((row) => row.id !== id);
        entries = entries.filter((row) => row.outfit_id !== id);
        data = [{ id }];
      } else data = outfits;
    } else if (table === 'outfit_items') data = entries;
    else if (table === 'save_outfit') {
      if (failSave)
        return route.fulfill({
          status: 409,
          json: { message: 'Una prenda seleccionada ya no está activa. Revisa la selección.' },
        });
      const body = request.postDataJSON();
      const id = body.outfit_id || ++nextId;
      const existing = outfits.find((row) => row.id === id);
      if (existing) Object.assign(existing, { name: body.outfit_name, notes: body.outfit_notes });
      else
        outfits.push({
          ...base,
          id,
          name: body.outfit_name,
          notes: body.outfit_notes,
          is_favorite: false,
        });
      const composition = (body.entries as { id?: number; item_id?: number }[]).map(
        (entry, position) =>
          entry.id
            ? { ...entries.find((row) => row.id === entry.id)!, position }
            : {
                id: ++nextEntry,
                outfit_id: id,
                user_id: uid,
                item_id: entry.item_id!,
                deleted_name: null,
                position,
              },
      );
      entries = [...entries.filter((row) => row.outfit_id !== id), ...composition];
      data = id;
    }
    if (request.method() === 'GET' && url.pathname.includes('/storage/')) {
      return route.fulfill({
        contentType: 'image/svg+xml',
        body: '<svg xmlns="http://www.w3.org/2000/svg" width="96" height="112"><rect width="96" height="112" fill="#b7c7a8"/></svg>',
      });
    }
    await route.fulfill({ json: data });
  });
  return {
    items,
    errors,
    failSave: (value: boolean) => {
      failSave = value;
    },
    failLoad: (value: boolean) => {
      failLoad = value;
    },
    removeItem: (itemId: number) => {
      const item = items.find((row) => row.id === itemId)!;
      entries = entries.map((row) =>
        row.item_id === itemId ? { ...row, item_id: null, deleted_name: item.name } : row,
      );
      items.splice(items.indexOf(item), 1);
    },
  };
}

test('outfit completo: selección, preview, orden, favoritos y borrado', async ({ page }) => {
  const state = await fixture(page);
  await page.goto('/outfits');
  await expect(
    page.getByRole('heading', { name: 'Recuerda lo que combina contigo' }),
  ).toBeVisible();
  await page.getByRole('link', { name: '+ Crear outfit' }).click();
  await page.getByLabel('Nombre *', { exact: true }).fill('Fin de semana');
  await page.getByLabel('Notas', { exact: true }).fill('Para salir a pasear');
  for (let id = 1; id <= 6; id++)
    await page.getByRole('checkbox', { name: 'Seleccionar Prenda ' + id, exact: true }).check();
  await page.getByLabel('Buscar prenda').fill('Prenda 6');
  await expect(page.locator('.outfit-selection > li')).toHaveCount(6);
  await page.getByRole('button', { name: 'Subir Prenda 6', exact: true }).click();
  await expect(page.locator('.outfit-selection > li').nth(4)).toContainText('Prenda 6');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.getByRole('button', { name: 'Crear outfit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Fin de semana' })).toBeVisible();
  await expect(page.getByText('Para salir a pasear')).toBeVisible();
  await expect(page.getByText('Sin asignar', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.locator('.outfit-detail-grid app-outfit-piece')).toHaveCount(6);
  await page.getByRole('button', { name: 'Marcar favorito' }).click();
  await expect(page.getByRole('button', { name: '★ Favorito' })).toHaveAttribute(
    'aria-pressed',
    'true',
  );
  await page.getByRole('link', { name: '← Volver a outfits' }).click();
  await expect(page.locator('.outfit-preview app-outfit-piece')).toHaveCount(4);
  await page.screenshot({ path: 'tmp/outfits-desktop.png', fullPage: true });
  await expect(page.getByRole('link', { name: 'Ver todas (+2)' })).toBeVisible();
  await page.getByLabel('Solo favoritos').check();
  await expect(page.locator('.outfit-card')).toHaveCount(1);
  await page.getByRole('button', { name: 'Quitar de favoritos: Fin de semana' }).click();
  await expect(page.locator('.outfit-card')).toHaveCount(0);
  await page.getByLabel('Solo favoritos').uncheck();
  await page.getByRole('link', { name: 'Fin de semana', exact: true }).click();
  state.items[0].name = 'Camisa renombrada';
  state.items[0].image_path = 'changed.png';
  state.items[0].item_locations = [];
  state.items[1].status = 'archived';
  state.items[1].item_locations = [];
  state.removeItem(5);
  await page.reload();
  await expect(page.getByText('Camisa renombrada', { exact: true })).toBeVisible();
  await expect(page.getByText('Prenda eliminada', { exact: true })).toBeVisible();
  await expect(page.getByText('Archivado', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: '← Volver a outfits' }).click();
  await expect(page.getByText('2 prendas archivadas o eliminadas')).toBeVisible();
  await page.getByRole('link', { name: 'Fin de semana', exact: true }).click();
  await page.getByRole('link', { name: 'Editar outfit' }).click();
  await page.getByLabel('Notas', { exact: true }).fill('Notas actualizadas');
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(page.getByText('Notas actualizadas')).toBeVisible();
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Eliminar outfit', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'Recuerda lo que combina contigo' }),
  ).toBeVisible();
  expect(state.items).toHaveLength(5);
  expect(state.errors).toEqual([]);
});

test('móvil, validaciones, errores y cambios pendientes', async ({ page }) => {
  const state = await fixture(page);
  await page.setViewportSize({ width: 390, height: 844 });
  state.failLoad(true);
  await page.goto('/outfits/new');
  await expect(page.getByRole('alert')).toContainText('No se pudo cargar');
  state.failLoad(false);
  await page.getByRole('button', { name: 'Reintentar' }).click();
  await page.getByRole('button', { name: 'Crear outfit', exact: true }).click();
  await expect(page.getByLabel('Nombre *', { exact: true })).toBeFocused();
  await page.getByLabel('Nombre *', { exact: true }).fill('Un vestido');
  await page.getByRole('button', { name: 'Crear outfit', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Añade al menos una prenda');
  await page.getByRole('checkbox', { name: 'Seleccionar Prenda 1', exact: true }).check();
  page.once('dialog', (dialog) => dialog.dismiss());
  await page.getByRole('link', { name: 'Cancelar', exact: true }).click();
  await expect(page).toHaveURL(/outfits\/new$/);
  state.failSave(true);
  await page.getByRole('button', { name: 'Crear outfit', exact: true }).click();
  await expect(page.getByRole('alert')).toContainText('Revisa la selección');
  await expect(page.getByLabel('Nombre *', { exact: true })).toHaveValue('Un vestido');
  await expect(page.locator('.outfit-selection > li')).toHaveCount(1);
  state.failSave(false);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Crear outfit', exact: true }).click();
  await expect(page.getByRole('heading', { name: 'Un vestido' })).toBeVisible();
  state.removeItem(1);
  await page.reload();
  await expect(page.getByText('Prenda eliminada', { exact: true })).toBeVisible();
  await page.getByRole('link', { name: 'Editar outfit' }).click();
  await page.getByRole('button', { name: 'Quitar Prenda 1', exact: true }).click();
  await page.getByRole('checkbox', { name: 'Seleccionar Prenda 2', exact: true }).check();
  await page.getByRole('button', { name: 'Guardar cambios' }).click();
  await expect(
    page.locator('.outfit-detail-grid').getByText('Prenda 2', { exact: true }),
  ).toBeVisible();
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'tmp/outfits-mobile.png', fullPage: true });
  expect(state.errors).toEqual([]);
});
