---
Nombre: Reducir transferencia de imágenes
Estado: En curso
Resumen: "Implementado en la v0.4.1: las fotos se suben como WebP de 1600 px como máximo y las URL firmadas (12 h) se reutilizan mientras siguen vigentes. Falta publicarlo y medir el egress."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-17
---

# Reducir transferencia de imágenes

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **media**). Las fotografías
se guardan con su resolución original y las URL firmadas se regeneran cada 45
minutos, así que se vuelven a descargar imágenes ya vistas. El egress del plan
gratuito de `devappsdpm-db` es compartido.

## Alcance

- Redimensionar y comprimir en el cliente antes de subir (tamaño máximo
  acordado).
- Reutilizar URL firmadas vigentes y la caché del navegador; medir el egress
  antes y después.
- Encaja con [[Tareas/Limitar Storage por usuario]].

## Avance · 2026-10-17

El cliente redimensiona con `prepareImage` (si el navegador no genera WebP o no ahorra, conserva el original) y `ItemStore` solo firma las rutas sin URL vigente: recargar el inventario o archivar ya no cambia las URL ni obliga a descargar otra vez las fotos. Verificado con `pnpm test` (35 tests), `pnpm test:editor` (11, con AXE) y `pnpm test:pwa`. Pendiente: publicar la v0.4.1 y comparar el egress antes y después.

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
