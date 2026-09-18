---
Nombre: Inventario y ubicación
Tipo: Store y dominio
Área: Inventario
Feature: inventory
Estado: Vigente
Ámbito: Ruta
Resumen: ItemStore concentra fotos privadas, ubicación, persistencia transaccional, archivado, restauración y limpieza de imágenes; filterItems combina filtros puros.
Fuente: src/app/inventory/item-data/item-store.ts
Entrada pública: ItemStore; filterItems; Item
Fecha de creación: 2026-09-18
Última modificación: 2026-09-18
---

El formulario y el plano usan la misma operación de ubicación. Las fotos usan
rutas del propietario y URLs firmadas. `save_item` guarda ficha, etiquetas y
ubicación en una transacción. El backend retira la ubicación al archivar.

El borrado definitivo registra una limpieza persistente antes de eliminar la
ficha; Storage se limpia mediante su API y se reintenta al cargar el inventario.
El cambio de foto encola la anterior dentro de la misma transacción.

Véase [[Decisiones/ADR-0002 Modelo de datos inicial]].
