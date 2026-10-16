---
Nombre: Proteger la cola image_cleanup
Estado: Pendiente
Resumen: "Hallazgo bajo de la auditoría del 2026-10-16: authenticated tiene SELECT, INSERT y DELETE sobre image_cleanup, así que un usuario puede vaciar o llenar su propia cola de borrado de imágenes."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
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

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
