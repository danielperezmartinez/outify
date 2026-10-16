---
Nombre: Limitar longitud de textos y filas por usuario
Estado: Pendiente
Resumen: "Hallazgo alto de la auditoría del 2026-10-16: varias columnas de texto no tienen CHECK de longitud y ninguna tabla tiene tope de filas por usuario; la BD de 500 MB es compartida."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
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

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
