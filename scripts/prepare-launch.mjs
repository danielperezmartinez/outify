// Captura la aplicación local con respuestas ficticias; nunca escribe datos remotos.
import { chromium } from '@playwright/test';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
const origin = process.env.OUTIFY_CAPTURE_URL || 'http://127.0.0.1:4201';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw new Error('Solo capturas locales');
for (const folder of ['public/brand', 'public/launch', 'public/launch/demo', 'public/icons'])
  await mkdir(folder, { recursive: true });
// Símbolo propio: una O que contiene el mapa de un armario con dos zonas.
const symbol = (ink, background = 'none') =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="${background}"/><rect x="14" y="11" width="36" height="42" rx="15" fill="none" stroke="${ink}" stroke-width="5"/><path d="M32 13v38m1-19h15" stroke="${ink}" stroke-width="4"/><path d="M21 25h5" stroke="${ink}" stroke-width="3" stroke-linecap="round"/></svg>`;
await writeFile('public/brand/symbol.svg', symbol('#334231'));
await writeFile('public/brand/symbol-inverse.svg', symbol('#F8F7F5'));
await writeFile('public/favicon.svg', symbol('#292724', '#B7C7A8'));
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const art = await browser.newPage();
  for (const [name, size, maskable] of [
    ['icon-192', 192],
    ['icon-512', 512],
    ['apple-touch-icon', 180],
    ['maskable-512', 512, true],
  ]) {
    await art.setViewportSize({ width: size, height: size });
    await art.setContent(
      `<body style="margin:0;background:#B7C7A8;display:grid;place-items:center;width:100vw;height:100vh">${symbol('#292724').replace('<svg ', `<svg width="${maskable ? size * 0.8 : size}" height="${maskable ? size * 0.8 : size}" `)}</body>`,
    );
    await art.screenshot({ path: `public/icons/${name}.png` });
  }
  await art.setViewportSize({ width: 240, height: 240 });
  await art.setContent(`<body style="margin:0;background:#B7C7A8">${symbol('#292724')}</body>`);
  await art.screenshot({ path: 'public/launch/thumbnail.png' });
  const shapes = {
    shirt:
      '<path d="M148 83l-46 30-48 85 48 27 25-41-9 226h164l-9-226 25 41 48-27-48-85-46-30-29 16h-46z"/><path d="M175 94l25 32 25-32M200 127v282M149 88l-8 85 35-29m75-56 8 85-35-29" fill="none"/><path d="M230 179h30v37h-30z" fill="none"/>',
    tee: '<path d="M152 95l-60 30-47 78 57 32 28-43-8 203h156l-8-203 28 43 57-32-47-78-60-30c-5 42-91 42-96 0z"/><path d="M150 99c7 61 95 61 100 0M128 380h144" fill="none"/>',
    trousers:
      '<path d="M128 72h144l17 338-72 5-17-215-17 215-72-5z"/><path d="M128 92h144M200 92v75m-61-65q-2 35-16 39m140-39q2 35 16 39M115 393l67 4m37 0 64-4" fill="none"/>',
    sweater:
      '<path d="M159 83l-60 30-53 240 55 15 29-168-8 207h156l-8-207 29 168 55-15-53-240-60-30q-40 35-82 0z"/><path d="M153 90q47 52 94 0M127 388h146M50 337l49 13m202 0 49-13" fill="none"/>',
    shoes:
      '<path d="M70 203l47-76 69 41 53 51 73 20q28 8 24 48H62q-9-49 8-84z"/><path d="M64 270h270M145 167l-29 39m47-26-29 39m48-27-29 39m47-25-28 37M256 227l-9 39" fill="none"/>',
    bag: '<path d="M107 170h186l23 221H84z"/><path d="M151 196v-75q0-58 49-58t49 58v75" fill="none" stroke-width="12"/><path d="M122 191l-15 175h186l-15-175" fill="none"/>',
  };
  const garments = [
    ['shirt', 'Camisa de lino', 'top', '#e6dfce', 1],
    ['tee', 'Camiseta salvia', 'top', '#9caf90', 1],
    ['trousers', 'Pantalón índigo', 'bottom', '#71818c', 2],
    ['sweater', 'Jersey de punto', 'top', '#c4ae91', 2],
    ['shoes', 'Zapatillas de diario', 'footwear', '#e2ddd2', 3],
    ['bag', 'Bolsa de algodón', 'accessory', '#c8b99d', null],
  ];
  await art.setViewportSize({ width: 400, height: 450 });
  for (const [shape, , , color] of garments) {
    await art.setContent(
      `<body style="margin:0"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 450" width="400" height="450"><rect width="400" height="450" fill="#F0EEE8"/><g fill="${color}" stroke="#57544d" stroke-width="2.5" stroke-linejoin="round">${shapes[shape]}</g></svg></body>`,
    );
    await art.screenshot({ path: `public/launch/demo/${shape}.png` });
  }
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  // Escribir PNG en public puede disparar una recarga del dev server a mitad de captura.
  await page.routeWebSocket('**', (socket) => socket.close());
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  const uid = '22222222-0000-4000-8000-000000000001';
  const timestamp = '2026-09-22T00:00:00Z';
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
    height: 600,
    z_index: 0,
  };
  const zones = [
    {
      id: 1,
      name: 'Prendas colgadas',
      type: 'section',
      color: '#DEE7D8',
      position_x: 24,
      position_y: 24,
      width: 352,
      height: 552,
    },
    {
      id: 2,
      name: 'Baldas',
      type: 'shelf',
      color: '#D9D6CF',
      position_x: 400,
      position_y: 24,
      width: 376,
      height: 264,
    },
    {
      id: 3,
      name: 'Calzado',
      type: 'shelf',
      color: '#C3BBB0',
      position_x: 400,
      position_y: 312,
      width: 376,
      height: 264,
    },
  ].map((z) => ({ ...base, wardrobe_id: 1, z_index: 0, ...z }));
  const items = garments.map(([shape, name, category, , zone], i) => ({
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
  const token = `e30.${Buffer.from(JSON.stringify({ sub: uid, exp: 4102444800 })).toString('base64url')}.demo`;
  await page.addInitScript(
    (session) => localStorage.setItem('outify-outify_dev-session', JSON.stringify(session)),
    {
      access_token: token,
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
  await page.route('https://zckqbrwdgxohdymiwbfz.supabase.co/**', async (route) => {
    const url = new URL(route.request().url());
    if (url.pathname.includes('/storage/v1/object/sign/')) {
      const body = route.request().postDataJSON();
      await route.fulfill({
        json: body.paths.map((path) => ({
          path,
          signedURL: `/object/public/outify-demo/${path.split('/').pop()}`,
          error: null,
        })),
      });
      return;
    }
    if (url.pathname.includes('/storage/v1/object/public/outify-demo/')) {
      const shape = url.pathname.split('/').pop();
      if (!garments.some(([key]) => `${key}.png` === shape)) throw new Error('Imagen desconocida');
      await route.fulfill({
        contentType: 'image/png',
        body: await readFile(`public/launch/demo/${shape}`),
      });
      return;
    }
    const resource = url.pathname.split('/').pop();
    let data = [];
    if (resource === 'get_workspace_status') data = 'active';
    if (resource === 'initialize_user_workspace') data = null;
    if (resource === 'wardrobes') data = [wardrobe];
    if (resource === 'zones') data = zones;
    if (resource === 'items') data = items;
    await route.fulfill({ json: data });
  });
  async function capture(path, ready, name) {
    await page.goto(origin + path);
    await page.getByRole('heading', { name: ready, exact: true }).waitFor();
    await page
      .locator(
        name === 'item' ? '.item-form' : name === 'inventory' ? '.item-card' : '.wardrobe-svg',
      )
      .first()
      .waitFor();
    await page.evaluate(() => document.fonts.ready);
    await page.waitForFunction(() =>
      Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    );
    if (name === 'item') {
      await page
        .getByRole('group', { name: 'Su lugar', exact: true })
        .screenshot({ path: 'public/launch/location.png' });
      await page.evaluate(() => window.scrollTo(0, 0));
    }
    await page.screenshot({ path: `public/launch/${name}.png` });
  }
  await capture('/wardrobes', 'Todo en su lugar.', 'wardrobe');
  await capture('/items', 'Tus artículos.', 'inventory');
  await capture('/items/1', 'Editar artículo.', 'item');
  await page.goto(origin + '/wardrobes');
  await page.getByRole('button', { name: 'Editar armarios' }).click();
  await page.getByRole('button', { name: 'Prendas colgadas, 2 artículos' }).click();
  await page.getByRole('button', { name: 'Snap activado' }).waitFor();
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.screenshot({ path: 'public/launch/editor.png' });
  if (errors.length) throw new Error(errors.join('\n'));
  // Los PNG de galería son composiciones de capturas, sin alterar los controles.
  const panels = [
    ['wardrobe', 'Your wardrobe, at a glance', 'A little map of where everything lives.'],
    ['inventory', 'Remember what you own', 'Your clothes, together in one private inventory.'],
    ['item', 'Give every item a place', 'Add the details. Choose a closet and a section.'],
    ['editor', 'Make your space your own', 'Draw, move and resize zones. Undo. Try again.'],
  ];
  const fonts = await readFile('src/fonts.css', 'utf8');
  await art.route('**/*', async (route) => {
    const path = new URL(route.request().url()).pathname;
    if (
      /^\/(fonts\/font-\d+\.woff2|launch\/(wardrobe|inventory|item|editor|location|demo\/shirt)\.png)$/.test(
        path,
      )
    ) {
      await route.fulfill({
        contentType: path.endsWith('.png') ? 'image/png' : 'font/woff2',
        body: await readFile(`public${path}`),
      });
    } else
      await route.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><html><head></head><body></body></html>',
      });
  });
  await art.goto(origin + '/__capture');
  for (const [i, [name, title, subtitle]] of panels.entries()) {
    await art.setViewportSize({ width: 1270, height: 760 });
    const content =
      name === 'item'
        ? '<div class="location-preview"><img class="garment" src="/launch/demo/shirt.png"><div><h2>Camisa de lino</h2><p>Your linen shirt. Its own place.</p><img class="location" src="/launch/location.png"></div></div>'
        : `<img src="/launch/${name}.png">`;
    await art.setContent(
      `<base href="${origin}"><style>${fonts}body{margin:0;background:#F8F7F5;color:#292724;font-family:'Atkinson Hyperlegible Next'}header{padding:30px 44px 22px;display:flex;align-items:center;justify-content:space-between}h1{font:400 34px Geologica;margin:0 0 8px;letter-spacing:-1px}p{margin:0;color:#4F4B46}strong{font:400 36px Geologica}main{display:flex;justify-content:center;background:#DEE7D8;padding:18px 0;height:536px;box-sizing:border-box}img{height:100%;width:auto;border:1px solid #B6B0A8}.location-preview{display:grid;grid-template-columns:300px 650px;align-items:center;gap:54px}.location-preview .garment{width:300px;height:auto}.location-preview h2{font:400 30px Geologica;margin:0 0 10px}.location-preview .location{width:650px;height:auto;margin-top:28px;background:#F8F7F5}footer{padding:18px 44px;display:flex;justify-content:space-between;font-size:14px}</style><header><div><h1>${title}</h1><p>${subtitle}</p></div><strong>outify ↗</strong></header><main>${content}</main><footer><span>Actual app · Sample inventory with original illustrations</span><span>Free at launch · App in Spanish · 0${i + 1} / 04</span></footer>`,
    );
    await art.evaluate(() => document.fonts.ready);
    await art.waitForFunction(() =>
      Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
    );
    await art.screenshot({ path: `public/launch/gallery-${i + 1}.png` });
  }
  await art.setViewportSize({ width: 1200, height: 630 });
  await art.setContent(
    `<base href="${origin}"><style>${fonts}body{margin:0;background:#F8F7F5;color:#292724;padding:60px;box-sizing:border-box;font-family:'Atkinson Hyperlegible Next'}header{font:400 38px Geologica;color:#334231;margin-bottom:50px}main{display:grid;grid-template-columns:1fr 1fr;gap:36px;align-items:center}h1{font:400 48px/1.15 Geologica;letter-spacing:-2px;margin:0 0 24px}img{width:100%;border:1px solid #B6B0A8}p{font-size:20px;color:#4F4B46}footer{margin-top:44px;font-size:15px}</style><header>outify ↗</header><main><div><h1>Know what you own.<br>Find where it lives.</h1><p>A visual wardrobe inventory.</p></div><img src="/launch/wardrobe.png"></main><footer>Free at launch · Google sign-in · App in Spanish · Actual app with sample content</footer>`,
  );
  await art.evaluate(() => document.fonts.ready);
  await art.waitForFunction(() =>
    Array.from(document.images).every((img) => img.complete && img.naturalWidth > 0),
  );
  await art.screenshot({ path: 'public/launch/social.png' });
  await writeFile(
    'public/launch/README.md',
    '# Recursos de lanzamiento\n\nGenerados con `node scripts/prepare-launch.mjs` contra el servidor local en 4201. No accede a cuentas reales: intercepta las llamadas de Supabase con un inventario ficticio.\n\nLas seis imágenes de prendas son ilustraciones originales creadas para Outify, sin marcas, fotografías de terceros ni información personal. Las capturas muestran la interfaz real con ese contenido de demostración. No son una prueba del backend remoto.\n\n- Miniatura: thumbnail.png, 240 × 240.\n- Galería: gallery-1.png a gallery-4.png, 1270 × 760.\n- Imagen social: social.png, 1200 × 630.\n- Capturas base: wardrobe.png, inventory.png, item.png y editor.png, 1440 × 1000.\n\nTextos y estado de lanzamiento: docs/Lanzamiento en Product Hunt.md. Símbolo y variantes: public/brand. Tipografías y licencias: public/fonts. La marca es una propuesta pendiente de validación visual por Daniel.\n',
  );
  console.log(
    'Marca, iconos, seis ilustraciones, cuatro capturas, cuatro galerías e imagen social preparados.',
  );
} finally {
  await browser.close();
}
