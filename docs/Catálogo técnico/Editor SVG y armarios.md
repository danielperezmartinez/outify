---
Nombre: Editor SVG y armarios
Tipo: Motor y componentes
Área: Armarios
Feature: wardrobes
Estado: Vigente
Ámbito: Feature
Resumen: Motor puro de geometría, restricciones, hit testing, miniaturas y comandos reversibles; adaptador SVG con Pointer Events y store de persistencia.
Fuente: src/app/wardrobes/wardrobe-canvas/engine/geometry.ts
Entrada pública: WardrobeStore; WardrobeCanvas; CommandHistory; transformRect; hitTest
Fecha de creación: 2026-09-18
Última modificación: 2026-09-18
---

El motor no importa Angular. Los gestos actualizan atributos SVG por frame y
emiten un comando al terminar; las flechas mueven y Mayús con flechas cambia
el tamaño. Los controles numéricos son la alternativa accesible.

`WardrobeStore` expone datos de solo lectura y es la fuente común para el plano
y los selectores del inventario. Los borrados de estructura conservan artículos
mediante las relaciones del backend.

Véanse [[Decisiones/ADR-0005 Arquitectura Angular orientada a features]] y
[[Decisiones/ADR-0006 Motor de edición con SVG nativo]].
