---
Nombre: Resolver EXECUTE de anon en workspace_active
Estado: Pendiente
Resumen: "Hallazgo de los tests locales del 2026-10-16: anon puede ejecutar las funciones SECURITY DEFINER outify_private.workspace_active() y outify_dev_private.workspace_active() sin excepción escrita; es el único fallo del job Seguridad."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
---

# Resolver EXECUTE de anon en workspace_active

## Hallazgo

Primera ejecución local de `supabase/tests/security/catalog.test.sql`
(2026-10-16), check 5: `anon` tiene `EXECUTE` sobre
`outify_private.workspace_active()` y `outify_dev_private.workspace_active()`.
La auditoría remota lo dio por inofensivo: devuelve un booleano sobre la sesión
actual y `anon` no tiene uso de los esquemas privados.

Las políticas restrictivas de `storage.objects` se aplican `to authenticated,anon`
en **todos** los buckets, también en los de las otras apps, y llaman a esta
función. Revocar `EXECUTE` a `anon` podría romper el Storage anónimo de
gift-card, nocendland o perro-sanxe.

## Alcance

- Elegir entre: (a) nota `Excepción - outify_private.workspace_active()` en
  [[Seguridad/Seguridad.base|Seguridad/]] y una migración con
  `comment on function … is 'excepcion: …'` en ambos entornos, o (b) limitar las
  políticas de Storage a `authenticated` y revocar `EXECUTE` a `anon`, después
  de comprobar que ninguna app depende de ello.
- Con el job `Seguridad` en verde, marcarlo como check obligatorio de `main`.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
