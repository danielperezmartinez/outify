---
Nombre: Lectura paginada
Tipo: Utilidad
Área: Compartida
Feature: shared
Estado: Vigente
Ámbito: Aplicación
Resumen: Lee páginas consecutivas mediante una función tipada y propaga errores sin truncar colecciones al límite por defecto del backend.
Fuente: src/app/shared/utilities/read-pages.ts
Entrada pública: readPages
Fecha de creación: 2026-09-18
Última modificación: 2026-09-18
---

No conoce modelos de dominio. La función consumidora aporta la consulta, el orden
estable y los límites inclusivos. Inventario y armarios comparten esta utilidad.
