---
Nombre: Coordinar pgrst.db_schemas entre apps
Estado: Pendiente
Resumen: "Hallazgo bajo de la auditoría del 2026-10-16: la migración outify_expose_api fija pgrst.db_schemas con una lista escrita a mano de los esquemas de las cuatro apps; cualquier app puede pisar la de las demás."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
---

# Coordinar pgrst.db_schemas entre apps

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **baja**). La migración
`20260918125925_outify_expose_api.sql` fija
`pgrst.db_schemas = 'public,graphql_public,gift_card,nocendland,outify,outify_dev'`
en el rol `authenticator`. Si otra app aplica su propia lista sin `outify`, la
API de Outify deja de responder, y al revés.

## Alcance

- Acordar con gift-card, nocendland y perro-sanxe un procedimiento único: quién
  cambia la lista y cómo se comprueba antes.
- Registrarlo como ADR si cambia la forma de exponer esquemas
  ([[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]).

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
