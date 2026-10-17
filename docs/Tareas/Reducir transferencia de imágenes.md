---
Nombre: Reducir transferencia de imágenes
Estado: En curso
Resumen: "Publicado en Production con la v0.4.1 el 2026-10-17: WebP de 1600 px como máximo y URL firmadas de 12 h reutilizadas. Falta medir el egress durante unos días y compararlo con el anterior."
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

Publicado y verificado el 2026-10-17. PR #4 integrada (`442aaf6`), checks `Verificar` y `Seguridad` en verde, y Production `dpl_ZsnZqCkPomkyjam8Zo7jBr9DkeL7` READY sin errores de runtime. Migración `20261017090000_outify_security_limits` aplicada en `devappsdpm-db` con aprobación expresa del usuario y versión del historial reasignada a la original. Comprobado con SELECT en remoto: 0 tablas sin RLS, 0 políticas de escritura `true`, 0 funciones SECURITY DEFINER sin `search_path` vacío o ejecutables por `anon` sin excepción, buckets de Outify con límite, 20 triggers y 18 CHECK nuevos. No se tocaron objetos de otras apps.
