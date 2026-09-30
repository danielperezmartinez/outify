---
Nombre: Implementar outfits guardados
Estado: Hecha
Resumen: Implementación verificada de outfits y publicación minor 0.4.0 acordada el 2026-09-30. Listado, ficha y editor con notas, favoritos, orden manual y referencias eliminadas. Migración remota preparada.
Decisiones: '[[Producto]]; [[Decisiones/ADR-0012 Composición persistente de outfits]]'
Bloqueada: []
Fecha de creación: 2026-09-30
Última modificación: 2026-09-30
---

# Implementar outfits guardados

Plan aprobado el 2026-09-30: sección Outfits con listado y preview de cuatro
prendas, consulta completa, edición, notas, favoritos, búsqueda y selección de
artículos activos. Orden manual, mínimo una prenda al crear y conservación de
entradas archivadas o eliminadas. Guardado transaccional y aislamiento por usuario.

Incluye migraciones en ambos esquemas, tipos, pruebas de dominio, base de datos,
flujo completo y accesibilidad. No incluye publicar ni cambiar la versión sin
acordarla. No modifica el historial del lanzamiento.

## Resultado verificado · 2026-09-30

Feature diferida en `src/app/outfits`, navegación adaptable a móvil, selector
filtrable y ficha de consulta. Preview limitada a cuatro entradas con aviso de
indisponibles calculado sobre toda la composición. Fotografías y ubicaciones
actuales reutilizan los stores del inventario.

Migración `20260930171430_outify_saved_outfits.sql` preparada para ambos
esquemas. Aplicada únicamente en el Supabase local aislado de pruebas.
`supabase/tests/outfits.sql` pasó con rollback: creación y orden, guardado
atómico, duplicados y mínimos, archivado/restauración, referencias de borrado,
aislamiento entre dos cuentas y limpieza por baja.
Tipos regenerados con Supabase CLI 2.118.0 para `outify` y `outify_dev`.

Validación final:

- `corepack pnpm test --watch=false`: 31 tests correctos.
- `corepack pnpm test:editor`: 11 tests correctos, incluidos los dos flujos de
  outfits con backend simulado y AXE en escritorio/móvil.
- `corepack pnpm test:pwa`: 1 test correcto.
- `corepack pnpm test:config`: 6 tests correctos.
- `corepack pnpm test:server`: 9 tests correctos.
- Builds de Preview y Production correctas.
- Revisión visual de las capturas `tmp/outfits-desktop.png` y
  `tmp/outfits-mobile.png`, sin desbordamiento horizontal.
- `git diff --check` correcto.

Las pruebas de navegador usan respuestas controladas; las invariantes del
servidor se probaron por separado con PostgreSQL real local. No se ha verificado
un despliegue remoto de esta función.

## Publicación acordada · v0.4.0

Daniel acordó expresamente el incremento minor y la versión **0.4.0** el 2026-09-30.
Rama de trabajo `feat/saved-outfits`. Publicación mediante Git, PR hacia `main` e integración
por squash siguiendo el flujo definido en [[README]].
Migración `20260930171430_outify_saved_outfits.sql` preparada para ambos esquemas.
Las declaraciones públicas y legales de la ampliación se publican junto con la función.
Los cambios previos de preparación de Product Hunt se conservaron.
