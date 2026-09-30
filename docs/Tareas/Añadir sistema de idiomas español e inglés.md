---
Nombre: Añadir sistema de idiomas español e inglés
Estado: Pendiente
Resumen: Crear un sistema ampliable de idiomas con español e inglés, selector y preferencia persistida; trabajo futuro que no bloquea el lanzamiento en Product Hunt.
Decisiones: '[[Producto]]; [[Lanzamiento en Product Hunt]]'
Bloqueada: []
Fecha de creación: 2026-09-26
Última modificación: 2026-09-26
---

# Añadir sistema de idiomas español e inglés

Solicitado por Daniel el 2026-09-26 para después del lanzamiento. Product Hunt
usará la presentación inglesa existente y avisará de que la app está en español.
Esta tarea no es un requisito para presentar Outify en Product Hunt.

## Alcance

- Elegir una solución compatible con Angular y la PWA, documentando la decisión
  antes de implementar. Evitar duplicar pantallas o condicionales por idioma.
- Extraer los textos de interfaz a catálogos mantenibles; empezar por `es` y `en`
  y permitir incorporar más idiomas sin modificar la lógica de negocio.
- Traducir acceso, admisión, inventario, editor, cuenta, avisos de actualización,
  validaciones, errores y etiquetas accesibles. Revisar también portada y páginas
  legales para que la navegación sea coherente; mantener equivalencia de versiones
  de los textos legales, sin cambiar sus compromisos al traducir.
- Incorporar selector accesible, recordar la elección y definir idioma inicial
  según preferencia guardada/navegador, con alternativa explícita si no se soporta.
- Adaptar `lang`, fechas, números y plurales. Los valores persistidos de dominio
  y las rutas siguen en inglés; no traducir automáticamente contenido del usuario.
- Comprobar persistencia de idioma, navegación, PWA y ausencia de pérdida de
  formularios o cambios del editor al cambiar de idioma.

## Criterios de finalización

- [ ] Catálogos ES/EN y mecanismo extensible, sin bifurcar reglas de negocio.
- [ ] Selector accesible y preferencia conservada tras recarga.
- [ ] Recorridos completos en ambos idiomas, sin claves ni textos sin traducir.
- [ ] Formatos, plurales, errores y accesibilidad coherentes con el idioma activo.
- [ ] Pruebas de recorridos y revisión visual en escritorio/móvil en ES y EN.
- [ ] Memoria y catálogo técnico actualizados; publicación con versión acordada.
