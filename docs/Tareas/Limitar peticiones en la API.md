---
Nombre: Limitar peticiones en la API
Estado: En curso
Resumen: "Regla aprobada por el usuario (30 peticiones/60 s por IP en /api/, respuesta 429), pero la API del Firewall de Vercel responde 404 en este proyecto: hay que crearla desde el panel."
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

Intento del 2026-10-17 con aprobación del usuario: `update_firewall_config` y `put_firewall_config` devuelven 404 «Seawall Config not found», con el nombre y con el id `prj_szp42yXWRAcl4hPaOLsnEvFPTBZA`. No se ha aplicado nada. Pendiente: crear la regla en Vercel → outify → Firewall → Rules (ruta que empieza por `/api/`, Rate Limit de ventana fija de 60 s, 30 peticiones, clave IP, acción 429) y anotarla en la checklist.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
