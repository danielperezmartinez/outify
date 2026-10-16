// Las URL firmadas se reutilizan mientras sigan vigentes: una URL nueva obliga al
// navegador a descargar otra vez la misma foto.
export const SIGNED_URL_SECONDS = 12 * 60 * 60;
export const RENEW_MARGIN_MS = 60 * 60 * 1000;

export interface SignedUrl {
  url: string;
  expiresAt: number;
}

export function pathsToSign(paths: string[], cache: Map<string, SignedUrl>, now: number) {
  return [...new Set(paths)].filter((path) => {
    const entry = cache.get(path);
    return !entry || entry.expiresAt - now <= RENEW_MARGIN_MS;
  });
}
