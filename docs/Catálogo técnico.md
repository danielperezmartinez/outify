---
Última modificación: 2026-09-18
---
# Catálogo técnico

Este sistema permite descubrir la superficie reutilizable de outify antes de
buscar por todo el repositorio o crear una implementación nueva. Cada fila
enlaza con su nota estructurada; después de localizar una candidata se abre su
implementación, que continúa siendo la fuente de verdad técnica.

[[Catálogo técnico/Catálogo técnico.base|Abrir la vista completa del catálogo]]

Piezas vigentes: [[Catálogo técnico/Sesión y cliente Supabase]],
[[Catálogo técnico/Inventario y ubicación]],
[[Catálogo técnico/Editor SVG y armarios]] y
[[Catálogo técnico/Lectura paginada]].

## Cómo utilizarlo

1. Filtrar la vista por tipo, área, feature o estado.
2. Evitar las piezas `En revisión` salvo que el trabajo incluya estabilizarlas.
3. Abrir la fuente antes de depender de los detalles del contrato o
   modificarla.
4. Añadir o actualizar la entrada en el mismo cambio que altere una superficie
   reutilizable.

## Política de evolución

- Se amplía una pieza existente cuando el nuevo caso conserva su
  responsabilidad y un contrato claro.
- Se crea una pieza nueva solo cuando representa un patrón estable diferente y
  se registra en el catálogo en el mismo cambio.
- Las adaptaciones de datos de dominio se realizan en el consumidor; las
  primitivas compartidas no conocen modelos de un área.
