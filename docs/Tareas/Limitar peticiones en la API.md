---
Nombre: Limitar peticiones en la API
Estado: En curso
Resumen: "El proyecto no tiene configuración de Firewall (consulta MCP del 2026-10-17). Hay una regla de límite de peticiones para /api/ propuesta, pendiente de aprobación para aplicarla en Vercel."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-17
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

## Avance · 2026-10-17

Regla propuesta: si la ruta empieza por `/api/`, ventana fija de 60 s, 30 peticiones por IP y respuesta 429. El cron diario `/api/account-deletion-retry` queda muy por debajo del límite. No se aplica sin la aprobación expresa del usuario.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
