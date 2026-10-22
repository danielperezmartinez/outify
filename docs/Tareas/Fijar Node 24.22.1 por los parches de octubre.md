---
Nombre: Fijar Node 24.22.1 por los parches de octubre
Estado: Hecha
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

- [x] PR con `Verificar`, `Seguridad` y `Fugas` en verde.
- [x] Integrada con squash y Production `READY`.
- [x] Log de Vercel: build con Node >=24.22.1; funciones en `24.x` (el parche
      exacto no aparece en los logs, véase Publicación).

## Verificación · 2026-10-23

En local con Node 24.22.1: `pnpm install --frozen-lockfile`,
`pnpm check:release` (0.4.6 → 0.4.7), `pnpm test:config` (6/6),
`pnpm test --watch=false` (35/35), `pnpm test:server` (9/9) y `pnpm build`
en verde.

## Publicación · 2026-10-23

Versión 0.4.7 aprobada por el usuario. PR #10 integrada con squash en `main`
(commit `9dee145`) con `Cambios`, `Verificar`, `Seguridad` y `Fugas` en verde;
el log de `Verificar` muestra `node: v24.22.1`. Production
`dpl_2YU7QHUKxa1m2qt85iTEdxyPpKKD` en `READY`. El proyecto de Vercel usa Node
`24.x`: la instalación del build pasó con `engines` `>=24.22.1 <25` y
`engineStrict`, así que corrió con Node >=24.22.1. El parche exacto del runtime
de las funciones no aparece en los logs; el usuario acepta cerrar la tarea sin
ese dato.
