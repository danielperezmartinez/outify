---
Nombre: Arquitectura Angular orientada a features
Número: 5
Estado: Aceptada
Resumen: Angular se organizará por flujos funcionales con rutas lazy y stores de Signals de alcance local; el motor del canvas quedará desacoplado y la reutilización se resolverá mediante composición y contratos estables.
Decisión: Adoptar una arquitectura feature-first con standalone components, Signals encapsulados y una política explícita de reutilización sin abstracciones especulativas.
Consecuencias: "La estructura mantiene juntas la UI, el estado y los datos de cada flujo y evita lógica bifurcada, a cambio de exigir límites claros para no convertir shared en un cajón de sastre."
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-18T09:56:11+02:00
Última modificación: 2026-09-18T09:56:11+02:00
---

# ADR-0005 · Arquitectura Angular orientada a features

## Contexto

Outify combina flujos CRUD habituales con un editor gráfico de alta frecuencia.
Una separación global por `components`, `services` y `models` dispersaría cada
flujo y favorecería que las pantallas duplicaran reglas. Al mismo tiempo, hacer
pasar cada movimiento del puntero por el estado reactivo de Angular introduciría
trabajo innecesario en el camino crítico del editor.

El usuario ha delegado la arquitectura Angular y ha pedido como norma explícita
generalizar componentes y lógica siempre que sea viable para evitar duplicación
y comportamientos divergentes.

## Decisión

### Organización

- El código se organiza por features y flujos: `platform`, `wardrobes`,
  `inventory`, `account` y `shared`.
- Cada feature mantiene cerca sus páginas, componentes, acceso a datos, estado y
  pruebas. Las rutas de `wardrobes`, `inventory` y `account` se cargan de forma
  diferida mediante componentes standalone.
- `platform` contiene únicamente capacidades transversales de la aplicación:
  sesión, cliente Supabase, guards y shell.
- `shared` contiene primitivas de interfaz y utilidades estables sin conocimiento
  de armarios, zonas o artículos. No será un depósito genérico.
- El motor del editor vive en `wardrobes/wardrobe-canvas/engine` y es TypeScript
  puro, sin imports de Angular ni Supabase.

### Estado y efectos

- El estado mutable se encapsula en stores de Signals proporcionados al nivel
  más estrecho posible: ruta, feature o componente.
- Los stores mantienen Signals escribibles privados y exponen Signals de solo
  lectura, selectores con `computed()` y acciones con nombres de dominio.
- `effect()` se limita a fronteras imperativas: persistencia, telemetría,
  sincronización con APIs del navegador o adaptación del motor. No se usa para
  propagar estado derivado.
- RxJS queda reservado para fuentes que ya sean streams y para composición
  asíncrona donde cancelación o concurrencia lo justifiquen; no se añade una
  segunda capa de store global.
- El estado transitorio de un gesto se mantiene dentro del motor. Angular recibe
  cambios confirmados al terminar comandos o en puntos de sincronización
  explícitos, no por cada `pointermove`.

### Reutilización

- Antes de crear una pieza se busca una implementación existente en la feature
  y en [[Catálogo técnico]].
- Una regla de negocio tiene una sola implementación en el dominio o store y es
  consumida por todas las pantallas.
- Se prefieren primitivas pequeñas y composición frente a componentes
  universales con numerosos flags.
- Una pieza permanece dentro de su feature mientras su contrato sea específico.
  Se mueve a `shared` cuando la responsabilidad sea estable y transversal.
- No se fuerza una abstracción solo por similitud visual accidental. La
  generalización debe conservar una responsabilidad única y un contrato más
  sencillo que sus consumidores.
- Toda nueva superficie reutilizable se registra en [[Catálogo técnico]] en el
  mismo cambio que la implementa.

## Alternativas consideradas

- Carpetas globales por tipo (`components`, `services`, `models`) — descartadas
  porque separan piezas que cambian juntas y dificultan reconocer los límites de
  cada flujo.
- Store global único — descartado porque acopla inventario, cuenta y editor y
  aumenta el coste de actualización y prueba.
- Angular como bucle de render del editor — descartado para los eventos de alta
  frecuencia; Angular seguirá controlando la UI y el estado confirmado.
- Extraer todo a `shared` desde el principio — descartado porque produce
  abstracciones especulativas y componentes con demasiadas variantes.

## Consecuencias

- Positivas: navegación clara por dominio, lazy loading natural, estado
  encapsulado, motor testeable sin navegador Angular y una sola fuente para cada
  regla de negocio.
- Negativas / compromisos: hay que vigilar los límites entre features y revisar
  de forma consciente cuándo una pieza está madura para ser compartida.
- Verificación: las revisiones comprobarán que no haya imports de Angular en el
  motor y que las piezas compartidas carezcan de dependencias de dominio.

## Fuentes

- [Guía de estilo de Angular](https://angular.dev/style-guide)
- [Signals en Angular](https://angular.dev/guide/signals)

## Decisiones relacionadas

- [[Decisiones/ADR-0006 Motor de edición con SVG nativo]]

## Tareas relacionadas

- [[Tareas/Completar plantillas de la bóveda de memoria]]
