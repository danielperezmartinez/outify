---
Nombre: Revisar entornos de la clave secreta de Supabase
Estado: En curso
Resumen: "Comprobado por MCP el 2026-10-17: OUTIFY_SUPABASE_SECRET_KEY es sensitive, pero está en Production y Preview. Está pendiente que el usuario decida si se retira de Preview."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-17
---

# Revisar entornos de la clave secreta de Supabase

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **media**).
`OUTIFY_SUPABASE_SECRET_KEY` la usan `api/account-deletion.mjs` y
`api/account-deletion-retry.mjs`. Es la clave secreta de todo `devappsdpm-db`,
no solo de Outify: quien la obtenga controla también las otras tres apps.

## Alcance

- Comprobar en Vercel en qué entornos existe (solo Production, salvo que las
  Previews necesiten la baja) y que está marcada como sensible. Solo lectura de
  metadatos; no descifrar el valor.
- Si Preview la necesita, valorar una clave de menor alcance o desactivar la
  baja en Preview, y registrar la decisión.
- Anotar el resultado en [[Seguridad/Checklist de lanzamiento#Vercel (outify)]].

## Avance · 2026-10-17

Metadatos leídos sin descifrar valores. Cualquier rama que genere una Preview tiene acceso a la clave secreta de todo `devappsdpm-db`. La API de baja responde 503 si falta la clave, así que retirarla de Preview desactiva la baja en las previews sin romper la build. Cambiarlo es un cambio remoto en Vercel y requiere aprobación expresa.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
