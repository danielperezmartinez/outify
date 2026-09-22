import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFileSync } from 'node:fs';

test('PWA instalable, apertura offline y actualización voluntaria', async ({
  page,
  context,
  request,
}) => {
  const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/login');
  const versionButton = page.getByRole('button', {
    name: `Versión ${version}. Comprobar actualizaciones`,
    exact: true,
  });
  await expect(versionButton).toBeVisible();
  await page.evaluate(() => navigator.serviceWorker.ready.then(() => true));
  await page.reload();
  await page.waitForFunction(() => !!navigator.serviceWorker.controller);
  const browserSession = await context.newCDPSession(page);
  const installability = await browserSession.send('Page.getInstallabilityErrors');
  // Playwright aísla cada prueba en incógnito; solo se excluye esa restricción del navegador.
  expect(
    installability.installabilityErrors.filter((error) => error.errorId !== 'in-incognito'),
  ).toEqual([]);
  await browserSession.detach();
  const manifest = await (await request.get('/manifest.webmanifest')).json();
  expect(manifest.display).toBe('standalone');
  for (const icon of manifest.icons) {
    expect((await request.get(icon.src)).headers()['content-type']).toBe('image/png');
  }
  const worker = await (await request.get('/ngsw.json')).json();
  expect(worker.appData.version).toBe(version);
  expect(worker.dataGroups).toEqual([]);
  expect(
    worker.assetGroups.every((group: { patterns: string[] }) => group.patterns.length === 0),
  ).toBe(true);
  await versionButton.click();
  await expect(page.getByText('Estás usando la última versión.')).toBeVisible();
  await page.getByRole('button', { name: 'Cerrar', exact: true }).click();

  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: /Tu ropa/ })).toBeVisible();
  await context.setOffline(false);
  await request.post('/__test/publish');
  await versionButton.click();
  await expect(page.getByText('Hay una nueva versión disponible')).toBeVisible();
  await expect(page.getByText(/Versión 99.0.0/)).toBeVisible();
  expect(await page.content()).not.toContain('<!-- test revision 1 -->');
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/pwa-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'test-results/pwa-mobile.png', fullPage: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Más tarde', exact: true }).click();
  await expect(page.getByText('Hay una nueva versión disponible')).not.toBeVisible();
  await versionButton.click();
  await expect(page.getByText('Hay una nueva versión disponible')).toBeVisible();
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect.poll(() => page.content()).toContain('<!-- test revision 1 -->');
  await expect(versionButton).toBeVisible();
  await expect(page.getByText('Hay una nueva versión disponible')).not.toBeVisible();
  // Ensayo local: restaurar código anterior con una versión nueva, según el flujo Git.
  await request.post('/__test/restore');
  await versionButton.click();
  await expect(page.getByText('Hay una nueva versión disponible')).toBeVisible();
  await page.getByRole('button', { name: 'Actualizar', exact: true }).click();
  await expect.poll(() => page.content()).not.toContain('<!-- test revision 1 -->');
  await expect(versionButton).toBeVisible();
  expect(errors).toEqual([]);
});
