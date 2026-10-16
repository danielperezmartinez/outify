---
Nombre: Revisar entornos de la clave secreta de Supabase
Estado: Pendiente
Resumen: "Hallazgo medio de la auditoría del 2026-10-16: OUTIFY_SUPABASE_SECRET_KEY es la clave de todo el proyecto compartido; comprobar que solo está en los entornos de Vercel que la necesitan y marcada como sensible."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
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

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
