import { pathsToSign, RENEW_MARGIN_MS, SignedUrl } from './signed-urls';
describe('URL firmadas de fotos', () => {
  const now = 1_000_000;
  it('firma solo las fotos sin URL o a punto de caducar, sin repetir rutas', () => {
    const cache = new Map<string, SignedUrl>([
      ['u/vigente.webp', { url: 'a', expiresAt: now + RENEW_MARGIN_MS + 1 }],
      ['u/caduca.webp', { url: 'b', expiresAt: now + RENEW_MARGIN_MS }],
    ]);
    expect(
      pathsToSign(['u/vigente.webp', 'u/caduca.webp', 'u/nueva.webp', 'u/nueva.webp'], cache, now),
    ).toEqual(['u/caduca.webp', 'u/nueva.webp']);
  });
});
