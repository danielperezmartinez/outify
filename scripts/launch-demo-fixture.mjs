// Datos de demostración locales. Ninguna petición de la grabación llega al backend remoto.
import { readFile } from 'node:fs/promises';

export async function prepareDemo(page, origin) {
  const uid = '22222222-0000-4000-8000-000000000001';
  const timestamp = '2026-09-27T00:00:00Z';
  const base = { user_id: uid, created_at: timestamp, updated_at: timestamp };
  const wardrobe = {
    ...base,
    id: 1,
    name: 'Armario del dormitorio',
    room: 'Dormitorio',
    description: 'Mi colección de cada día',
    position_x: 0,
    position_y: 0,
    width: 800,
    height: 400,
    z_index: 0,
  };
  let zones = [
    {
      id: 1,
      name: 'Prendas colgadas',
      type: 'section',
      color: '#DEE7D8',
      position_x: 24,
      position_y: 24,
      width: 352,
      height: 352,
    },
    {
      id: 2,
      name: 'Baldas',
      type: 'shelf',
      color: '#D9D6CF',
      position_x: 400,
      position_y: 24,
      width: 376,
      height: 160,
    },
    {
      id: 3,
      name: 'Calzado',
      type: 'shelf',
      color: '#C3BBB0',
      position_x: 400,
      position_y: 216,
      width: 376,
      height: 160,
    },
  ].map((z) => ({ ...base, wardrobe_id: 1, z_index: 0, ...z }));
  const garments = [
    ['shirt', 'Camisa de lino', 'top', 1],
    ['tee', 'Camiseta salvia', 'top', 1],
    ['trousers', 'Pantalón índigo', 'bottom', 2],
    ['sweater', 'Jersey de punto', 'top', 2],
    ['shoes', 'Zapatillas de diario', 'footwear', 3],
    ['bag', 'Bolsa de algodón', 'accessory', null],
  ];
  const items = garments.map(([shape, name, category, zone], i) => ({
    ...base,
    id: i + 1,
    name,
    category,
    status: 'active',
    image_path: `${uid}/${shape}.png`,
    description: 'Prenda ficticia del inventario de demostración.',
    brand: '',
    size_label: 'M',
    material: '',
    primary_color: '',
    seasons: ['spring', 'autumn'],
    item_locations: zone ? [{ zone_id: zone }] : [],
    item_tags: [],
  }));
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await page.routeWebSocket('**', (socket) => socket.close());
  await page.addInitScript(
    (session) => {
      localStorage.setItem('outify-outify_dev-session', JSON.stringify(session));
    },
    {
      access_token: `e30.${Buffer.from(JSON.stringify({ sub: uid, exp: 4102444800 })).toString('base64url')}.demo`,
      refresh_token: 'demo-only',
      expires_at: 4102444800,
      expires_in: 3600,
      token_type: 'bearer',
      user: {
        id: uid,
        aud: 'authenticated',
        email: 'demo@example.invalid',
        user_metadata: {},
        app_metadata: {},
        created_at: timestamp,
      },
    },
  );
  // Lista cerrada: solo archivos locales y respuestas simuladas, incluidos los cambios.
  await page.route('**/*', async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    if (url.origin === origin && !url.pathname.startsWith('/api/')) return route.continue();
    if (url.hostname !== 'zckqbrwdgxohdymiwbfz.supabase.co') {
      errors.push(`Petición bloqueada: ${url.origin}${url.pathname}`);
      return route.abort();
    }
    if (url.pathname.includes('/storage/v1/object/sign/')) {
      return route.fulfill({
        json: request
          .postDataJSON()
          .paths.map((path) => ({
            path,
            signedURL: `/object/public/outify-demo/${path.split('/').pop()}`,
            error: null,
          })),
      });
    }
    if (url.pathname.includes('/storage/v1/object/public/outify-demo/')) {
      const shape = url.pathname.split('/').pop();
      if (!garments.some(([key]) => `${key}.png` === shape)) throw new Error('Imagen desconocida');
      return route.fulfill({
        contentType: 'image/png',
        body: await readFile(`public/launch/demo/${shape}`),
      });
    }
    const resource = url.pathname.split('/').pop();
    let data;
    if (resource === 'get_workspace_status') data = 'active';
    else if (resource === 'initialize_user_workspace') data = null;
    else if (resource === 'wardrobes') data = [wardrobe];
    else if (resource === 'items') data = items;
    else if (resource === 'image_cleanup') data = [];
    else if (resource === 'item_locations' && request.method() === 'POST') {
      const body = request.postDataJSON();
      items.find((i) => i.id === body.item_id).item_locations = [{ zone_id: body.zone_id }];
      data = null;
    } else if (resource === 'zones') {
      if (request.method() === 'PATCH') {
        const id = Number(url.searchParams.get('id').replace('eq.', ''));
        Object.assign(
          zones.find((z) => z.id === id),
          request.postDataJSON(),
        );
        data = zones.find((z) => z.id === id);
      } else data = zones;
    } else if (resource === 'restore_zone_state') {
      const body = request.postDataJSON();
      zones = zones.filter((z) => z.id !== body.target_id);
      if (body.restored_state) zones.push(body.restored_state);
      data = body.restored_state;
    } else {
      errors.push(`Petición sin simular: ${request.method()} ${resource}`);
      return route.fulfill({ status: 500, json: { message: 'Petición no prevista en la demo' } });
    }
    return route.fulfill({ json: data });
  });
  return {
    errors,
    items,
    get zones() {
      return zones;
    },
  };
}
