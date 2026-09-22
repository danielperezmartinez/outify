---
Nombre: Editor SVG y armarios
Tipo: Motor y componentes
Área: Armarios
Feature: wardrobes
Estado: Vigente
Ámbito: Feature
Resumen: Geometría con snap opcional, historial de snapshots de zonas y armario, gestos SVG y guardado optimista; restauración transaccional de zonas y ubicaciones con control de conflictos.
Fuente: src/app/wardrobes/wardrobe-canvas/engine/geometry.ts
Entrada pública: WardrobeStore; WardrobeCanvas; CommandHistory; transformRect; hitTest
Fecha de creación: 2026-09-18
Última modificación: 2026-09-19
---

El motor no importa Angular. Los gestos actualizan atributos SVG por frame y
emiten un comando al terminar; las flechas mueven y Mayús con flechas cambia
el tamaño. Los controles numéricos son la alternativa accesible.

`WardrobeStore` expone datos de solo lectura y es la fuente común para el plano
y los selectores del inventario. Los borrados de estructura conservan artículos
mediante las relaciones del backend.

`CommandHistory<T>` conserva snapshots sin alias y ofrece `canUndo`/`canRedo`.
`EditorCommand` incluye geometría, propiedades, altas/bajas de zonas y propiedades
del armario. La vista no mueve las pilas durante un guardado pendiente y restaura
la pila si falla la operación. El historial vive en memoria y se reinicia al
cambiar de armario; no es un backup persistente.

`WardrobeCanvas.snapping` controla la cuadrícula de 8 unidades. Mayús suspende el
snap en Pointer Events, incluido el último evento al soltar. El toggle también
está disponible en móvil. El gesto confirma su posición antes de la respuesta
remota; el store revierte el snapshot si el guardado falla.

`WardrobeStore.restoreZoneState` usa `restore_zone_state`: operación SQL invoker
con RLS que conserva el identificador, restaura propiedades y ubicaciones en una
transacción y rechaza snapshots o ubicaciones que ya hayan cambiado. La migración
`20260919075341_outify_zone_history.sql` debe aplicarse antes de publicar este
frontend. Preparación y evidencia: [[Tareas/Corregir interacciones del editor y navegación]].

Véanse [[Decisiones/ADR-0005 Arquitectura Angular orientada a features]] y
[[Decisiones/ADR-0006 Motor de edición con SVG nativo]].
