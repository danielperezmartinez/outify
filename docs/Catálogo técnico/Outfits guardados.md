---
Nombre: Outfits guardados
Tipo: Feature y store
Área: Outfits
Feature: outfits
Estado: Vigente
Ámbito: Ruta
Resumen: Contrato local verificado de listado, consulta y editor de outfits con selección ordenada, notas, favoritos y datos actuales del inventario; publicación pendiente.
Fuente: src/app/outfits/outfit-data/outfit-store.ts
Entrada pública: OUTFIT_ROUTES; OutfitStore; OutfitPiece; save_outfit
Fecha de creación: 2026-09-30
Última modificación: 2026-09-30
---

Rutas diferidas `/outfits`, `/outfits/new`, `/outfits/:id` y
`/outfits/:id/edit`. Stores limitados a la ruta: OutfitStore, ItemStore y
WardrobeStore. El primero limpia sus datos cuando cambia el acceso al espacio,
lee todas las páginas y descarta respuestas antiguas.

`save_outfit` guarda nombre, notas y selección en una transacción. El favorito
se actualiza de forma independiente. `outfit_items` conserva identidad y orden;
una referencia eliminada solo conserva nombre. Los datos actuales y URLs firmadas
se obtienen del inventario, sin subir ni copiar fotografías.

`OutfitPiece` presenta foto, nombre, estado y ubicación en tarjeta, ficha y
selector; solo la ficha muestra enlaces al artículo y armario.

Fuente funcional: [[Producto]]. Modelo: [[Decisiones/ADR-0012 Composición persistente de outfits]].
Pruebas y publicación: [[Tareas/Implementar outfits guardados]].
