---
Nombre: Motor de edición con SVG nativo
Número: 6
Estado: Aceptada
Resumen: El editor de armarios usará SVG nativo sobre un motor TypeScript propio, con modelo de escena, comandos, Pointer Events y render agrupado por frame para escritorio y móvil.
Decisión: Implementar el canvas visual como SVG DOM nativo y reservar foreignObject o overlays HTML para controles puntuales, no para la escena principal.
Consecuencias: "SVG facilita selección, geometría, accesibilidad y depuración del MVP, pero exige controlar el número de nodos y desacoplar los eventos de alta frecuencia de Angular."
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-18T09:56:11+02:00
Última modificación: 2026-09-18T09:56:11+02:00
---

# ADR-0006 · Motor de edición con SVG nativo

## Contexto

El MVP necesita crear, seleccionar, mover y redimensionar armarios y zonas
rectangulares, además de mostrar miniaturas y aceptar arrastre con ratón, táctil
y lápiz. La escena inicial tendrá un número moderado de objetos y se beneficia
de conservar cada forma como un elemento identificable.

La investigación distingue dos tecnologías que suelen llamarse «canvas»:

- `<canvas>` de HTML es un bitmap inmediato. Sus elementos HTML hijos son
  contenido alternativo y no se pintan dentro del bitmap.
- `<svg>` mantiene una escena vectorial en el DOM. Puede incluir HTML mediante
  `<foreignObject>`, aunque esa capacidad existe desde hace años y no convierte
  `<canvas>` en un contenedor de HTML.

## Decisión

### Representación y límites

- La escena se renderiza con SVG nativo: grupos `<g>`, formas, imágenes, texto,
  guías y tiradores de selección.
- El documento se expresa en unidades lógicas independientes de píxeles. El
  viewport mantiene su propia matriz de pan y zoom.
- `getScreenCTM()` y `DOMMatrix` convierten coordenadas de pantalla a escena.
- `<foreignObject>` se reserva para casos puntuales que realmente necesiten
  layout HTML. Formularios, menús y toolbars se renderizan como HTML fuera del
  SVG siempre que sea posible.
- No se introduce una librería de diagramación ni un motor gráfico externo en el
  MVP.

### Motor propio

El motor TypeScript, independiente de Angular, se divide en responsabilidades:

1. modelo de documento y escena;
2. herramientas y máquina de estados de interacción;
3. hit testing, selección, snapping y restricciones;
4. transformación de viewport y coordenadas;
5. comandos reversibles con undo/redo;
6. adaptador de render SVG;
7. adaptador de persistencia fuera del núcleo.

Durante un gesto, el motor conserva estado transitorio mutable y actualiza solo
los atributos o transformaciones necesarios en un único
`requestAnimationFrame`. Al confirmar el gesto emite un comando y un snapshot
inmutable para el store de Signals y el guardado automático. Las lecturas y
escrituras del DOM se agrupan y no se intercalan.

### Escritorio, móvil y accesibilidad

- Se usan Pointer Events como modelo único para ratón, táctil y lápiz.
- Al iniciar un gesto se usa `setPointerCapture()` para mantener la operación
  aunque el puntero salga del objeto.
- `touch-action` se configura de forma explícita en el viewport; la página sigue
  desplazándose fuera del área de edición.
- Un segundo puntero habilita pan y zoom por pellizco. Los tiradores visuales
  pueden tener áreas de impacto transparentes mayores en táctil.
- Arrastrar nunca será la única vía: seleccionar, mover, redimensionar y asignar
  tendrán alternativas mediante teclado o controles accesibles.
- Los elementos interactivos dispondrán de nombre, estado, foco visible y orden
  de navegación; el movimiento respetará `prefers-reduced-motion`.
- `getCoalescedEvents()` puede mejorar trazos futuros, pero no es requisito del
  MVP porque su soporte aún no es uniforme.

### Rendimiento

- El objetivo de interacción se valida con mediciones en móviles reales y no
  con una promesa rígida de 60 FPS en todo dispositivo.
- La ruta crítica evita recrear subárboles Angular y objetos de dominio por cada
  movimiento.
- Las miniaturas se cargan y decodifican a tamaños adecuados; la vista limita lo
  mostrado con el indicador `+N` definido en [[Producto]].
- Si las mediciones muestran que el número de nodos DOM es el cuello de botella,
  se podrá añadir virtualización espacial o un renderer bitmap sin cambiar el
  modelo, los comandos ni las herramientas del motor.

## Alternativas consideradas

- Canvas 2D — ofrece control total de dibujo, pero obliga a implementar hit
  testing, foco, semántica y actualización completa de la escena para un MVP de
  objetos geométricos editables.
- Librería de canvas o diagramación — acelera algunos gestos, pero aumenta el
  peso, el acoplamiento y el riesgo de adaptar el producto a su modelo.
- HTML posicionado — sencillo para paneles, pero menos natural para zoom, grupos,
  coordenadas y geometría vectorial.
- `<foreignObject>` para todos los objetos — descartado porque multiplica el
  coste de layout HTML y complica la interoperabilidad y accesibilidad de la
  escena.

## Consecuencias

- Positivas: escena inspeccionable, formas editables, escalado nativo, hit
  testing del navegador y mejor base semántica que un bitmap.
- Negativas / compromisos: hay que mantener pequeño el DOM, diseñar navegación
  por teclado y establecer una frontera estricta entre el motor y Angular.
- Evolución: el núcleo permite reemplazar o complementar el renderer si las
  pruebas de rendimiento lo justifican.

## Fuentes

- [Elemento canvas en el estándar HTML](https://html.spec.whatwg.org/multipage/canvas.html)
- [Contenido embebido y foreignObject en SVG 2](https://www.w3.org/TR/SVG2/embedded.html)
- [Pointer Events nivel 3](https://www.w3.org/TR/pointerevents3/)
- [Matriz de transformación de SVG](https://developer.mozilla.org/en-US/docs/Web/API/SVGGraphicsElement/getScreenCTM)
- [requestAnimationFrame](https://developer.mozilla.org/en-US/docs/Web/API/Window/requestAnimationFrame)
- [Accesibilidad en SVG 2](https://www.w3.org/TR/SVG/access)

## Decisiones relacionadas

- [[Decisiones/ADR-0005 Arquitectura Angular orientada a features]]
- [[Decisiones/ADR-0002 Modelo de datos inicial]]

## Tareas relacionadas

- [[Tareas/Completar plantillas de la bóveda de memoria]]
