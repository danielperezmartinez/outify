---
Nombre: Usar Chromium de Playwright en local
Estado: En curso
Resumen: "Las pruebas e2e y los scripts de lanzamiento usan el Chromium de Playwright en vez de Google Chrome, igual que el CI, para funcionar en Linux sin instalar Chrome."
Decisiones: ""
Bloqueada: []
Fecha de creación: 2026-10-19
Última modificación: 2026-10-19
---

# Usar Chromium de Playwright en local

## Contexto

El equipo de desarrollo ha pasado de Windows a Linux. Las configuraciones de
Playwright (`playwright*.config.ts`) y los scripts de lanzamiento
(`prepare-launch.mjs`, `prepare-launch-video.mjs` y `render-launch-media.mjs`)
pedían `channel: 'chrome'` fuera del CI, y Google Chrome no está instalado.

## Alcance

- Quitar `channel: 'chrome'` de las tres configuraciones de Playwright y de los
  tres scripts de lanzamiento: siempre se usa el Chromium de Playwright, como
  en el CI (`pnpm exec playwright install chromium`).

## Verificación · 2026-10-19

En local (Linux) y sin `CI=1`: `pnpm build`, `pnpm test:pwa` (1/1) y
`pnpm test:editor` (11/11) en verde. Los scripts de lanzamiento solo se han
comprobado con `node --check`. Pendiente: aprobar la versión, abrir la PR y
verificar el CI y el despliegue.
