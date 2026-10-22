---
Nombre: Fijar Node 24.22.1 por los parches de octubre
Estado: En curso
Resumen: "El CI fija Node 24.22.1 y engines exige >=24.22.1 <25, versión que corrige los fallos de seguridad de Node del 21 de octubre de 2026; Vercel la toma al desplegar."
Decisiones: ""
Bloqueada: []
Fecha de creación: 2026-10-23
Última modificación: 2026-10-23
---

# Fijar Node 24.22.1 por los parches de octubre

## Contexto

El 21 de octubre de 2026 Node publicó versiones de seguridad (CVE públicos,
corregidos en 24.22.1). La política común de versión de Node de las webs del
usuario pide la versión exacta en los workflows y un mínimo en `engines`.

Diagnóstico: las funciones de Vercel (`api/account-deletion*.mjs`) solo llaman
a Supabase (host fijo de variable de entorno), así que la exposición es baja.
No hay Go, Java, Python, Rust, almacenes de raíces propios ni binarios
publicados.

## Alcance

- `.github/workflows/ci.yml`: `setup-node` con `node-version: '24.22.1'`.
- `package.json`: `engines.node` `>=24.22.1 <25` y versión 0.4.7 (patch).
- `README.md`: requisito de Node actualizado.

## Criterios de finalización

- [ ] PR con `Verificar`, `Seguridad` y `Fugas` en verde.
- [ ] Integrada con squash y Production `READY`.
- [ ] Log de Vercel: build y funciones con Node >=24.22.1.

## Verificación · 2026-10-23

En local con Node 24.22.1: `pnpm install --frozen-lockfile`,
`pnpm check:release` (0.4.6 → 0.4.7), `pnpm test:config` (6/6),
`pnpm test --watch=false` (35/35), `pnpm test:server` (9/9) y `pnpm build`
en verde.
