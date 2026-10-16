---
Nombre: Limitar Storage por usuario
Estado: Pendiente
Resumen: "Hallazgo alto de la auditoría del 2026-10-16: no hay cuota de Storage por usuario; imágenes de hasta 8 MB en un plan gratuito de 1 GB compartido por cuatro apps."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
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

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
