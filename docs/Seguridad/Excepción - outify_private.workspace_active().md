---
Nombre: Excepción - outify_private.workspace_active()
Tipo: Excepción
Estado: Vigente
Regla: "Se revoca EXECUTE a anon en las funciones SECURITY DEFINER salvo excepción escrita."
Objeto: "outify_private.workspace_active() y outify_dev_private.workspace_active()"
Resumen: "anon conserva EXECUTE porque las políticas restrictivas de Outify en storage.objects se aplican a authenticated y anon en todos los buckets. La función solo devuelve si la sesión actual tiene un espacio activo; para anon siempre es false y no expone datos."
Revisar antes de: 2027-01-17
Última modificación: 2026-10-17
---

# Excepción - outify_private.workspace_active()

Cubre los dos entornos. Ambas funciones llevan el comentario
`excepcion: Excepción - outify_private.workspace_active()`, que añadió la
migración `20261017090000_outify_security_limits.sql`.

## Justificación

Las políticas `outify_workspace_images` y `outify_dev_workspace_images` de
`storage.objects` son `as restrictive ... to authenticated, anon` y llaman a
`workspace_active()`. Se aplican a todo `storage.objects` del proyecto compartido
`devappsdpm-db`, no solo a los buckets de Outify. Si se revocara `EXECUTE` a
`anon`, cualquier petición anónima a Storage de gift-card, nocendland o
perro-sanxe podría fallar al evaluar la política.

La función devuelve un booleano sobre la sesión del llamante (`auth.uid()` y
`session_id` del JWT). Para `anon` no hay sesión y devuelve `false`. No acepta
parámetros ni devuelve datos de otros usuarios. `anon` no tiene `USAGE` sobre
los esquemas `*_private`.

## Mitigaciones

- `search_path=''` y nombres cualificados (lo comprueba
  `supabase/tests/security/catalog.test.sql`).
- Alternativa para retirar la excepción: limitar esas políticas a
  `authenticated` y revocar `EXECUTE` a `anon`, después de comprobar con las
  otras apps que ninguna depende del acceso anónimo. Hasta entonces se mantiene.
