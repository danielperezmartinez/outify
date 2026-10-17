---
Nombre: Proteger la cola image_cleanup
Estado: Hecha
Resumen: "Mitigado y aplicado en remoto el 2026-10-17: tope de 1000 entradas por usuario y cuota de Storage que cuenta todas sus fotos. Mover la limpieza al servidor queda como mejora opcional."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-17
---

# Proteger la cola image_cleanup

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **baja**). La política
`owner` y los grants de `outify.image_cleanup` y `outify_dev.image_cleanup`
permiten al usuario insertar y borrar sus propias entradas. No afecta a otros
usuarios (lo confirma `isolation.test.sql`), pero el usuario puede dejar
imágenes huérfanas en Storage, que ocupan cuota compartida, o encolar rutas
arbitrarias dentro de su carpeta.

## Alcance

- Retirar `INSERT` y `DELETE` directos a `authenticated` y escribir solo desde
  triggers o funciones del servidor, o mover la cola a `*_private`.
- Test de que el usuario no puede modificar la cola.

## Avance · 2026-10-17

El cliente usa la cola para reservar subidas y limpiarlas (`ItemStore.upload`, `retireImage` y `cleanupImages`), así que retirar `INSERT`/`DELETE` exigiría mover la limpieza al servidor. Con la cuota por usuario, las fotos huérfanas solo consumen el espacio de su dueño, y el tope de filas acota la cola. Mover la limpieza al servidor sigue siendo una mejora opcional. Verificado en local el 2026-10-17 (Supabase CLI 2.117.0, base desechable con todas las migraciones): `supabase test db supabase/tests/security` en verde (catálogo, aislamiento y límites), y `invariants`, `zone-history`, `outfits` y `account-lifecycle` correctas. No se ha aplicado en `devappsdpm-db`: falta la aprobación expresa para aplicar la migración `20261017090000_outify_security_limits.sql` y el job `Seguridad` en verde en la PR.

## Verificación

Publicado y verificado el 2026-10-17. PR #4 integrada (`442aaf6`), checks `Verificar` y `Seguridad` en verde, y Production `dpl_ZsnZqCkPomkyjam8Zo7jBr9DkeL7` READY sin errores de runtime. Migración `20261017090000_outify_security_limits` aplicada en `devappsdpm-db` con aprobación expresa del usuario y versión del historial reasignada a la original. Comprobado con SELECT en remoto: 0 tablas sin RLS, 0 políticas de escritura `true`, 0 funciones SECURITY DEFINER sin `search_path` vacío o ejecutables por `anon` sin excepción, buckets de Outify con límite, 20 triggers y 18 CHECK nuevos. No se tocaron objetos de otras apps.
