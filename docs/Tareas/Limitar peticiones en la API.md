---
Nombre: Limitar peticiones en la API
Estado: Pendiente
Resumen: "Hallazgo medio de la auditoría del 2026-10-16: las funciones de /api no tienen límite de peticiones."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
---

# Limitar peticiones en la API

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **media**). Las funciones
`/api/account-deletion` y `/api/account-deletion-retry` exigen sesión o
secreto, pero no tienen límite de peticiones: se pueden invocar en bucle y
consumir invocaciones de Vercel y peticiones de Auth del proyecto compartido.

## Alcance

- Regla de límite de peticiones del Firewall de Vercel para `/api/*`, o límite
  en la propia función si el plan no lo permite.
- Documentar la regla en [[Seguridad/Checklist de lanzamiento#Vercel (outify)]];
  si se configura en el panel, dejar constancia de su valor.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
