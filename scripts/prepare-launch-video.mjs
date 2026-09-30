// Graba interacciones reales con datos locales y prepara los pasos de Arcade.
// Requiere servidor Angular en 4201, Chrome y FFmpeg; no publica ni despliega.
import { chromium, expect } from '@playwright/test';
import { mkdir, readFile, writeFile, copyFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { prepareDemo } from './launch-demo-fixture.mjs';

const origin = process.env.OUTIFY_CAPTURE_URL || 'http://127.0.0.1:4201';
if (!['localhost', '127.0.0.1'].includes(new URL(origin).hostname))
  throw new Error('Solo servidor local');
const output = resolve('tmp/Outify-Product-Hunt-Media');
const work = resolve('tmp/launch-video-work');
for (const dir of [output, `${output}/arcade`, work]) await mkdir(dir, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
const viewport = { width: 1440, height: 900 };
const editorOnly = process.env.OUTIFY_CAPTURE_EDITOR_ONLY === '1';
const steps = editorOnly
  ? JSON.parse(await readFile(`${output}/arcade/steps.json`, 'utf8')).slice(0, 6)
  : [];
const scenes = editorOnly
  ? JSON.parse(await readFile(`${work}/scenes.json`, 'utf8')).filter((s) => s.name !== '04-editor')
  : [];
const pause = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function ready(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.waitForFunction(() =>
    [...document.images].every((i) => i.complete && i.naturalWidth > 0),
  );
  await pause(250);
}
async function cursor(page) {
  await page.evaluate(() => {
    document.getElementById('demo-cursor')?.remove();
    const pointer = document.createElement('div');
    pointer.id = 'demo-cursor';
    pointer.style.cssText =
      'position:fixed;left:0;top:0;pointer-events:none;z-index:2147483647;display:none;filter:drop-shadow(0 2px 2px #0005)';
    pointer.innerHTML =
      '<svg width="24" height="30" viewBox="0 0 24 30"><path d="M2 2v24l6-7 5 10 5-3-5-9h9z" fill="#292724" stroke="#fff" stroke-width="2"/></svg>';
    document.body.append(pointer);
    document.addEventListener('pointermove', (e) => {
      pointer.style.display = 'block';
      pointer.style.transform = `translate(${e.clientX}px,${e.clientY}px)`;
    });
    document.addEventListener('pointerdown', (e) => {
      const ring = document.createElement('div');
      ring.style.cssText = `position:fixed;left:${e.clientX - 16}px;top:${e.clientY - 16}px;width:32px;height:32px;border:2px solid #52664E;border-radius:50%;pointer-events:none;z-index:2147483646;`;
      document.body.append(ring);
      ring
        .animate(
          [
            { transform: 'scale(.4)', opacity: 1 },
            { transform: 'scale(1.8)', opacity: 0 },
          ],
          650,
        )
        .finished.then(() => ring.remove());
    });
  });
}
async function glide(page, target) {
  const box = await target.boundingBox();
  if (!box) throw new Error('Destino no visible');
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2, { steps: 30 });
  await pause(450);
}
async function click(page, target) {
  await glide(page, target);
  await target.click();
  await pause(600);
}
async function snapshot(page, name, title, text, target) {
  await ready(page);
  await page.evaluate(() => {
    const p = document.getElementById('demo-cursor');
    if (p) p.style.visibility = 'hidden';
  });
  await page.screenshot({ path: `${output}/arcade/${name}.png` });
  const box = target ? await target.boundingBox() : null;
  steps.push({
    file: `${name}.png`,
    title,
    text,
    hotspot: box
      ? {
          x: (box.x + box.width / 2) / viewport.width,
          y: (box.y + box.height / 2) / viewport.height,
        }
      : null,
  });
  await page.evaluate(() => {
    const p = document.getElementById('demo-cursor');
    if (p) p.style.visibility = '';
  });
}
async function recordScene(name, path, setup, action) {
  if (editorOnly && name !== '04-editor') return;
  const context = await browser.newContext({
    viewport,
    recordVideo: { dir: work, size: viewport },
    serviceWorkers: 'block',
  });
  const page = await context.newPage();
  const epoch = Date.now();
  const demo = await prepareDemo(page, origin);
  if (name === '04-editor') demo.items[5].item_locations = [{ zone_id: 2 }];
  await page.goto(origin + path);
  await setup(page);
  await ready(page);
  await cursor(page);
  await pause(300);
  const start = (Date.now() - epoch) / 1000;
  await action(page, demo);
  const duration = (Date.now() - epoch) / 1000 - start;
  if (demo.errors.length) throw new Error(demo.errors.join('\n'));
  await expect(page.getByRole('alert')).toHaveCount(0);
  const video = page.video();
  await context.close();
  const raw = `${work}/${name}.webm`;
  await video.saveAs(raw);
  scenes.push({ name, raw, start, duration });
  console.log(`Escena ${name}: ${duration.toFixed(1)} segundos, sin errores`);
}
try {
  await recordScene(
    '01-overview',
    '/wardrobes',
    (p) => p.locator('.wardrobe-svg').waitFor(),
    async (page) => {
      await snapshot(
        page,
        '01-wardrobe',
        'A place for everything',
        'Your wardrobe becomes a visual map. Open Artículos to explore your clothes.',
        page.getByRole('link', { name: 'Artículos', exact: true }),
      );
      await pause(1800);
      await glide(page, page.locator('[data-item="1"]'));
      await click(page, page.getByRole('button', { name: 'Alejar', exact: true }));
      await pause(2300);
      await click(page, page.getByRole('button', { name: 'Ajustar', exact: true }));
      await pause(2000);
    },
  );
  await recordScene(
    '02-inventory',
    '/items',
    (p) => p.locator('.item-card').first().waitFor(),
    async (page) => {
      const search = page.getByLabel('Buscar', { exact: true });
      await snapshot(
        page,
        '02-inventory',
        'Remember what you own',
        'Keep your clothes together in one inventory. Let’s search for our linen shirt: “lino”.',
        search,
      );
      await pause(1500);
      await click(page, search);
      await search.pressSequentially('lino', { delay: 190 });
      await expect(page.locator('.item-card')).toHaveCount(1);
      await snapshot(
        page,
        '03-search',
        'Find the piece you need',
        'The search narrows your collection. Open Camisa de lino to see its details.',
        page.locator('.item-card').first(),
      );
      await pause(1800);
      await click(page, page.locator('.item-card').first());
      await page.locator('.item-form').waitFor();
      await ready(page);
      await cursor(page);
      await snapshot(
        page,
        '04-details',
        'Every item has a story',
        'A photo, a name and the details that matter. Return to Armarios to give another item a home.',
        page.getByRole('link', { name: 'Armarios', exact: true }),
      );
      await pause(2200);
    },
  );
  await recordScene(
    '03-location',
    '/wardrobes',
    (p) => p.locator('.wardrobe-svg').waitFor(),
    async (page, demo) => {
      const location = page.getByLabel('Ubicación de Bolsa de algodón');
      await snapshot(
        page,
        '05-unassigned',
        'Give every item a place',
        'This cotton bag is unassigned. Choose Baldas, the shelf section, as its home.',
        location,
      );
      await pause(1800);
      await glide(page, location);
      await location.selectOption('2');
      await pause(850);
      await expect(
        page.getByRole('button', { name: 'Baldas, 3 artículos', exact: true }),
      ).toBeVisible();
      if (demo.items[5].item_locations[0].zone_id !== 2)
        throw new Error('Ubicación no guardada en la demo');
      await glide(page, page.locator('[data-item="6"]'));
      await expect(page.locator('[data-zone="2"] [data-item="6"]')).toBeVisible();
      await snapshot(
        page,
        '06-assigned',
        'Right where it belongs',
        'Your bag now lives on the shelf. Open Editar armarios to reshape your space.',
        page.getByRole('button', { name: 'Editar armarios' }),
      );
      await pause(2400);
    },
  );
  await recordScene(
    '04-editor',
    '/wardrobes',
    (p) => p.locator('.wardrobe-svg').waitFor(),
    async (page) => {
      await click(page, page.getByRole('button', { name: 'Editar armarios' }));
      await click(page, page.getByRole('button', { name: 'Baldas, 3 artículos', exact: true }));
      await page.evaluate(() => window.scrollTo({ top: 220, behavior: 'smooth' }));
      await pause(900);
      const handle = page.locator('[data-zone="2"] [data-resize]');
      await snapshot(
        page,
        '07-editor',
        'Make your space your own',
        'Drag a zone’s corner to resize it. Snap helps you align it; hold Shift for free movement.',
        handle,
      );
      await pause(1200);
      const box = await handle.boundingBox();
      await glide(page, handle);
      await page.mouse.down();
      for (let i = 1; i <= 40; i++) {
        await page.mouse.move(
          box.x + box.width / 2 - (70 * i) / 40,
          box.y + box.height / 2 - (28 * i) / 40,
        );
        await pause(25);
      }
      await page.mouse.up();
      await expect(page.getByText('Todo guardado', { exact: true })).toBeVisible();
      await expect(page.locator('[data-zone="2"] .zone-background')).not.toHaveAttribute(
        'width',
        '376',
      );
      await pause(1100);
      await snapshot(
        page,
        '08-resized',
        'Room to change your mind',
        'Your layout is saved as you work. Undo and redo let you try another arrangement.',
        null,
      );
      await click(page, page.getByRole('button', { name: 'Deshacer', exact: true }));
      await expect(page.locator('[data-zone="2"] .zone-background')).toHaveAttribute(
        'width',
        '376',
      );
      await pause(1500);
      await click(page, page.getByRole('button', { name: 'Rehacer', exact: true }));
      await pause(1900);
    },
  );
  await writeFile(`${work}/scenes.json`, JSON.stringify(scenes, null, 2));
  await writeFile(`${output}/arcade/steps.json`, JSON.stringify(steps, null, 2));
  await writeFile(
    `${output}/arcade/GUIÓN.md`,
    '# Guion para Arcade\n\nLas imágenes se importan en orden numérico, todas a 1440 × 900.\nLos textos siguientes se copian en los puntos de interacción. Las coordenadas son porcentajes desde la esquina superior izquierda.\n\n' +
      steps
        .map(
          (s, i) =>
            `## ${i + 1}. ${s.file}\n\n**Título:** ${s.title}\n\n**Texto:** ${s.text}\n\n**Punto:** ${s.hotspot ? `${(s.hotspot.x * 100).toFixed(1)} % horizontal; ${(s.hotspot.y * 100).toFixed(1)} % vertical` : 'Botón de avanzar'}\n`,
        )
        .join('\n') +
      '\nAl último paso se añade una pantalla final: “Know what you own. Find where it lives.”, enlace https://outify.vercel.app/en y aviso “Free at launch · Google sign-in · App in Spanish”.\n',
  );
  console.log(`Material capturado en ${output}`);
} finally {
  await browser.close();
}
