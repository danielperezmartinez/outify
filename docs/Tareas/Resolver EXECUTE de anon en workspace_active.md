---
Nombre: Resolver EXECUTE de anon en workspace_active
Estado: En curso
Resumen: "Resuelto con la excepción escrita y el comentario excepcion: en ambas funciones (opción a); el job Seguridad pasa en local. Falta aplicar la migración en remoto y marcar el job como obligatorio."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-17
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

## Avance · 2026-10-17

Nota [[Seguridad/Excepción - outify_private.workspace_active()]] y `comment on function` en la migración `20261017090000_outify_security_limits.sql`. Se descartó revocar el permiso porque las políticas restrictivas de Storage se aplican a `anon` en todos los buckets del proyecto compartido. Verificado en local el 2026-10-17 (Supabase CLI 2.117.0, base desechable con todas las migraciones): `supabase test db supabase/tests/security` en verde (catálogo, aislamiento y límites), y `invariants`, `zone-history`, `outfits` y `account-lifecycle` correctas. No se ha aplicado en `devappsdpm-db`: falta la aprobación expresa para aplicar la migración `20261017090000_outify_security_limits.sql` y el job `Seguridad` en verde en la PR.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
