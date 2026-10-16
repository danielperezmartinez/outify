---
Nombre: Limitar longitud de textos y filas por usuario
Estado: En curso
Resumen: "Implementado y verificado en local en la v0.4.1: CHECK de longitud en todos los textos editables, topes de filas por usuario y límites maxlength en los formularios. Falta aplicarlo en remoto."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-17
---

# Limitar longitud de textos y filas por usuario

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **alta**). Los `name` tienen
límite, pero `description`, `primary_color`, `brand`, `size_label`,
`material`, `room`, `notes`, `display_name`, `avatar_url` y `deleted_name` no
lo tienen, y no hay tope de filas por usuario en armarios, zonas, artículos,
etiquetas ni outfits. La base de datos de 500 MB del plan gratuito se comparte
con otras tres apps.

## Alcance

- `CHECK` de longitud en todas las columnas de texto editables, en ambos
  esquemas, alineado con los límites de los formularios.
- Tope de filas por usuario (trigger o comprobación en las RPC `save_*`).
- Migración versionada y tests; el formulario muestra el límite al usuario.

## Avance · 2026-10-17

Límites acordados con el usuario el 2026-10-17: descripciones y notas ≤ 1000, campos cortos ≤ 80, URL ≤ 2048. Topes: 20 armarios, 200 zonas, 500 prendas, 200 etiquetas, 300 outfits, 20 prendas por outfit y 1000 entradas en `image_cleanup`. Además, 20 etiquetas por prenda (`save_item` aceptaba listas sin límite). El nombre y el avatar de OAuth se ajustan al darse de alta para no bloquearla. Verificado en local el 2026-10-17 (Supabase CLI 2.117.0, base desechable con todas las migraciones): `supabase test db supabase/tests/security` en verde (catálogo, aislamiento y límites), y `invariants`, `zone-history`, `outfits` y `account-lifecycle` correctas. No se ha aplicado en `devappsdpm-db`: falta la aprobación expresa para aplicar la migración `20261017090000_outify_security_limits.sql` y el job `Seguridad` en verde en la PR.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
