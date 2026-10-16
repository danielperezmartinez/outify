---
Nombre: Limitar Storage por usuario
Estado: Hecha
Resumen: "Cuota de 50 MB y 500 fotos por usuario y tope de 250 MB por bucket de Outify, aplicados en remoto y verificados el 2026-10-17 (v0.4.1)."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-17
---

# Limitar Storage por usuario

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **alta**). Los buckets
`outify-item-images` y `outify-dev-item-images` limitan cada fichero a 8 MB y a
JPEG/PNG/WebP, pero no hay cuota por usuario. El Storage de `devappsdpm-db` es
de 1 GB en plan gratuito y lo comparten gift-card, nocendland y perro-sanxe: un
solo usuario puede agotarlo y dejar sin servicio a todas.

## Alcance

- Cuota por usuario (bytes y número de objetos) comprobada en el servidor: en la
  política restrictiva de Storage o en `guard_image_write`.
- Revisar si 8 MB es razonable tras redimensionar en el cliente
  ([[Tareas/Reducir transferencia de imágenes]]).
- Migración versionada para ambos entornos y test en `supabase/tests/security/`.
- Diseñar el límite pensando en el conjunto de las cuatro apps.

## Avance · 2026-10-17

Trigger `guard_image_quota` en `storage.objects`, uno por entorno, que solo actúa sobre `outify-item-images` o `outify-dev-item-images`. No toca los buckets ni las políticas de otras apps. Si Storage aún no conoce el tamaño al insertar, el exceso máximo es un fichero (8 MB). Verificado en local el 2026-10-17 (Supabase CLI 2.117.0, base desechable con todas las migraciones): `supabase test db supabase/tests/security` en verde (catálogo, aislamiento y límites), y `invariants`, `zone-history`, `outfits` y `account-lifecycle` correctas. No se ha aplicado en `devappsdpm-db`: falta la aprobación expresa para aplicar la migración `20261017090000_outify_security_limits.sql` y el job `Seguridad` en verde en la PR.

## Verificación

Publicado y verificado el 2026-10-17. PR #4 integrada (`442aaf6`), checks `Verificar` y `Seguridad` en verde, y Production `dpl_ZsnZqCkPomkyjam8Zo7jBr9DkeL7` READY sin errores de runtime. Migración `20261017090000_outify_security_limits` aplicada en `devappsdpm-db` con aprobación expresa del usuario y versión del historial reasignada a la original. Comprobado con SELECT en remoto: 0 tablas sin RLS, 0 políticas de escritura `true`, 0 funciones SECURITY DEFINER sin `search_path` vacío o ejecutables por `anon` sin excepción, buckets de Outify con límite, 20 triggers y 18 CHECK nuevos. No se tocaron objetos de otras apps.
