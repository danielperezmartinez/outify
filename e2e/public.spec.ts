import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('presentación y documentos públicos sin sesión, fuentes propias y enlaces de acceso', async ({
  page,
}) => {
  const errors: string[] = [];
  const fontRequests: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('request', (request) => {
    if (/fonts\.(googleapis|gstatic)\.com/.test(request.url())) fontRequests.push(request.url());
  });
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Tu ropa, a la vista');
  await expect(page.locator('img[alt*="Pantalla de Outify"]')).toBeVisible();
  await page.evaluate(() => document.fonts.ready);
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  await page.screenshot({ path: 'tmp/landing-desktop.png', fullPage: true });
  await page.getByRole('link', { name: 'English', exact: true }).click();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Know what you own');
  await expect(
    page.getByText('The app and legal documents are currently in Spanish.'),
  ).toBeVisible();
  await page.setViewportSize({ width: 390, height: 844 });
  expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'tmp/landing-mobile.png', fullPage: true });
  for (const [url, heading] of [
    ['/privacy', 'Política de privacidad'],
    ['/terms', 'Condiciones de uso'],
  ]) {
    await page.goto(url);
    await expect(page.getByRole('heading', { level: 1, name: heading, exact: true })).toBeVisible();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  }
  await page.goto('/login');
  await expect(page.getByRole('link', { name: 'Privacidad', exact: true })).toHaveAttribute(
    'href',
    '/privacy',
  );
  await expect(page.getByRole('link', { name: 'Condiciones', exact: true })).toHaveAttribute(
    'href',
    '/terms',
  );
  expect(fontRequests).toEqual([]);
  expect(errors).toEqual([]);
});
