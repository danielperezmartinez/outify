---
Nombre: Composición persistente de outfits
Número: 12
Estado: Aceptada
Resumen: Outfits y entradas ordenadas privadas con guardado transaccional; las prendas eliminadas conservan solo su último nombre como referencia.
Decisión: Referenciar artículos actuales y conservar una entrada sin imagen cuando se elimina el artículo.
Consecuencias: Añade dos tablas y una RPC en ambos entornos; no duplica imágenes ni modifica la ubicación de los artículos.
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-30
Última modificación: 2026-09-30
---

# ADR-0012 · Composición persistente de outfits

## Contexto

[[Producto]] amplía el inventario con combinaciones guardadas.
[[ADR-0002 Modelo de datos inicial]] ya preveía tablas adicionales para conjuntos;
esta decisión desarrolla esa extensión sin reemplazar el modelo inicial.
Trabajo: [[Tareas/Implementar outfits guardados]].

## Decisión

`outfits` guarda propietario, nombre, notas, favorito y fechas. `outfit_items`
guarda identidad estable, posición y referencia al artículo; las claves compuestas
impiden cruzar propietarios. RLS y la política de espacio activo protegen las
lecturas, favoritos y eliminación. La composición solo se escribe mediante
`save_outfit`, con implementación privilegiada en el esquema privado, propietario
comprobado y bloqueo coordinado con la baja, el archivado y el borrado de prendas.

Cada selección enviada contiene el identificador de una entrada existente o el
del artículo activo nuevo. El servidor valida toda la composición antes de
confirmar. El identificador 0 representa un outfit nuevo. Las posiciones reflejan
el orden enviado. No se aceptan referencias históricas inventadas por el cliente.

Un trigger de borrado conserva el último nombre del artículo, pone a nulo su
referencia y no guarda su fotografía. La entrada sigue siendo editable en orden
y puede retirarse, incluso cuando todas las prendas originales hayan desaparecido.
El borrado del perfil elimina outfits y entradas mediante cascada.

## Alternativas consideradas

- Copiar fichas e imágenes: descartado para evitar ubicaciones obsoletas y
  fotografías conservadas después de eliminar la prenda.
- Borrar automáticamente la composición: descartado porque perdería la
  combinación que el usuario quiere recordar.
- Bloquear el borrado de artículos utilizados: descartado por añadir dependencia
  al flujo actual del inventario.

## Consecuencias

Se incorporan tablas y funciones equivalentes en producción y desarrollo.
Los tipos se generan desde PostgreSQL y las pruebas SQL verifican el aislamiento,
el guardado atómico y el ciclo de vida. Los datos actuales se resuelven al abrir
las pantallas, sin suscripciones en tiempo real.
