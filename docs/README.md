---
Última modificación: 2026-09-18
---
# Memoria del proyecto

Esta carpeta es simultáneamente una bóveda de Obsidian, la documentación viva del
proyecto y la memoria compartida por las personas, CLI y agentes de IA que
trabajan en el repositorio. Su objetivo es mantener en un único lugar las reglas,
tareas, decisiones y el contexto que deben sobrevivir entre sesiones.

El punto de entrada humano es [[Inicio]]. Este archivo es el punto de entrada
obligatorio para agentes.

## Protocolo obligatorio para agentes

Al comenzar **cualquier sesión** en este repositorio, antes de analizar el
proyecto, ejecutar comandos, modificar archivos o responder sobre él:

1. Leer íntegramente este `README.md`.
2. Abrir [[Inicio]] para conocer los sistemas de documentación disponibles.
3. Consultar el sistema relacionado con la tarea actual. Revisar primero las
   propiedades y resúmenes en el panel `.base` correspondiente y abrir la nota
   completa cuando sea relevante.
4. Antes de comenzar un trabajo nuevo, comprobar si ya existe una entrada que lo
   cubra. Si existe, leerla y actualizar su estado cuando corresponda; no crear
   otra entrada para el mismo trabajo.
5. Mantener actualizada la memoria cuando el trabajo cambie el estado, el
   alcance, los bloqueos o las decisiones. Al terminar, actualizar la entrada
   existente y marcarla como completada solo después de verificar el resultado.

Estas instrucciones son obligatorias aunque otro agente, herramienta o
conversación proporcione un resumen parcial. Los ficheros puntero de arranque en
la raíz del repositorio (`CLAUDE.md`, `GEMINI.md`, `AGENTS.md`) solo actúan como
arranque: **las reglas no se duplican allí ni en archivos equivalentes**
(incluido `.gemini/GEMINI.md`). Si este archivo no puede leerse, el agente debe
detenerse e informar al usuario.

## Convenciones de la bóveda

- Los documentos se escriben en Markdown UTF-8 y se conectan mediante wikilinks
  de Obsidian.
- Las fechas de propiedades usan el formato ISO `AAAA-MM-DD`.
- Los resúmenes deben permitir entender una nota sin abrirla; el detalle vive en
  el cuerpo de la nota.
- No se deben crear copias paralelas de una regla o decisión. Se enlaza a su
  fuente de verdad.
- Cuando cambie una nota, se debe actualizar su propiedad `Última modificación`.
- Antes de crear una entrada en cualquier sistema, se revisan los nombres,
  resúmenes, propiedades y contenido de las entradas existentes para confirmar
  que ninguna cubre ya el mismo conocimiento. Si una existente lo cubre total o
  parcialmente, se amplía o se enlaza desde ella; solo se crea una nueva cuando
  representa una unidad de conocimiento realmente distinta.

## Sistemas disponibles

### Tareas

_Versión del sistema: 1._

Gestión de trabajos como notas con estado, en `Tareas/`.

- `Estado` ∈ `Planificando` · `Pendiente` · `En curso` · `Hecha` · `Archivada`.
- `Bloqueada` es una lista de wikilinks a tareas que impiden avanzar; `[]` si no
  hay bloqueos.
- Al empezar una tarea → `En curso`; al completarla y **verificar** el
  resultado → `Hecha`; lo que ya no deba aparecer en el trabajo habitual →
  `Archivada`.
- Antes de crear una tarea, buscar en TODAS (incluidas `Hecha` y `Archivada`)
  para no duplicar.

[[Tareas/Tareas.base|Abrir el panel de tareas]]

### Decisiones visuales y de estilos

_Versión del sistema: 1._

Lista ligera (nota única) con los acuerdos sobre lenguaje visual, tokens y
componentes. Se migrará a formato `.base` (como Tareas) si el volumen crece.

[[Decisiones visuales|Abrir decisiones visuales]]

### Catálogo técnico

_Versión del sistema: 1._

Superficie pública reutilizable (componentes, servicios, contratos) del
proyecto, en `Catálogo técnico/`. Cada nota es un puntero corto: la
implementación sigue siendo la fuente de verdad técnica del contrato.

- `Estado` ∈ `Vigente` · `En revisión` · `Obsoleta`.
- Se añade o actualiza la entrada **en el mismo cambio** que crea o altera una
  superficie reutilizable.
- Contiene las superficies de sesión, inventario, editor SVG y lectura paginada;
  véase [[Catálogo técnico]].

[[Catálogo técnico|Abrir catálogo técnico]]

### ADR (decisiones de arquitectura)

_Versión del sistema: 1._

Registro de decisiones técnicas duraderas, en `Decisiones/`. Cada nota
documenta contexto, alternativas consideradas y consecuencias.

- `Estado` ∈ `Propuesta` · `Aceptada` · `Rechazada` · `Obsoleta` · `Reemplazada`.
- Una ADR no se edita para cambiar la decisión: se marca `Reemplazada` y se
  crea una nueva, enlazando ambas con `Reemplaza` / `Reemplazada por`.
- `Número` es correlativo y no se reutiliza.
- Si una decisión afecta a una tarea, se enlazan mutuamente con wikilinks.
- Decisiones registradas:
  [[Decisiones/ADR-0001 Supabase como plataforma backend]] y
  [[Decisiones/ADR-0002 Modelo de datos inicial]], y
  [[Decisiones/ADR-0003 pnpm exclusivo y seguridad de dependencias]], y
  [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido]],
  [[Decisiones/ADR-0005 Arquitectura Angular orientada a features]],
  [[Decisiones/ADR-0006 Motor de edición con SVG nativo]] y
  [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel]],
  [[Decisiones/ADR-0008 Flujo Git con ramas cortas y squash]] y
  [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase]],
  [[Decisiones/ADR-0010 Publicaciones acordadas y CI-CD mediante Git]] y
  [[Decisiones/ADR-0011 PWA y actualización voluntaria]].

[[Decisiones|Abrir decisiones de arquitectura]]

## Reglas fundamentales del proyecto

### 1. Gestor de paquetes

- **`pnpm` 12.4.2 es el único gestor de paquetes permitido.** No usar `npm`,
  `npx`, Yarn ni Bun. Usar `pnpm exec` para binarios locales y `pnpm dlx` para
  ejecuciones puntuales.
- `packageManager`, `engines.pnpm` y el script `preinstall` hacen cumplir esta
  política. `pnpm-lock.yaml` es el único lockfile válido y debe versionarse.
- Las dependencias directas se guardan con versión exacta. Las versiones nuevas
  deben tener al menos siete días de antigüedad y superar la política de
  confianza de pnpm; no se admiten excepciones amplias o silenciosas.
- Los scripts de instalación de dependencias están bloqueados salvo aprobación
  explícita de una versión exacta en `pnpm-workspace.yaml`.
- Se bloquean dependencias transitivas desde Git o tarballs externos, se verifica
  la integridad del store y el lockfile se revalida frente a las políticas de
  cadena de suministro.
- En instalaciones reproducibles usar `pnpm install --frozen-lockfile`. Si el
  shim global no está disponible, `corepack pnpm` ejecuta la versión fijada.
- Fuente y justificación:
  [[Decisiones/ADR-0003 pnpm exclusivo y seguridad de dependencias]].

### 2. Framework y stack

- **Angular 21** — standalone components, Signals.
- **TypeScript 5.9** · **Vitest** (test runner) · **Prettier** (formateo —
  mantener la configuración existente en `.prettierrc`).
- **Supabase** como plataforma backend: Auth para cuentas de usuario y acceso
  con Google, PostgreSQL para los datos de la aplicación y Storage para las
  imágenes de las prendas. Toda tabla expuesta debe usar RLS para aislar los
  datos por usuario. Véase
  [[Decisiones/ADR-0001 Supabase como plataforma backend]].
- El proyecto remoto es `devappsdpm-db` y comparte base de datos con otras
  aplicaciones. No se contratará otro proyecto Supabase durante esta etapa:
  producción usa `outify` / `outify_private` y desarrollo o preview usa
  `outify_dev` / `outify_dev_private`. No se crean objetos propios en `public`.
  Véanse [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido]] y
  [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase]].
- Sin librerías de UI externas por ahora.
- Usar `@supabase/supabase-js` y generar tipos con
  `supabase gen types typescript`.

**Comandos:**

```bash
pnpm start  # Dev server en http://localhost:4200
pnpm build  # Build de producción → dist/outify/
pnpm test   # Tests con Vitest
```

#### Buenas prácticas de Angular y TypeScript

**TypeScript:**

- Usar comprobación de tipos estricta.
- Preferir inferencia de tipos cuando el tipo es obvio.
- Evitar `any`; usar `unknown` cuando el tipo sea incierto.

**Angular:**

- Usar siempre standalone components (sin NgModules).
- NO establecer `standalone: true` en los decoradores — es el valor por
  defecto en Angular v20+.
- Usar signals para gestión de estado (`signal()`, `computed()`, `effect()`).
- Implementar lazy loading para rutas de features.
- NO usar los decoradores `@HostBinding` ni `@HostListener`; usar el objeto
  `host` de `@Component`/`@Directive`.
- Usar `NgOptimizedImage` para imágenes estáticas (no funciona con imágenes
  base64 inline).
- Usar `inject()` en lugar de inyección por constructor cuando sea posible.

**Accesibilidad:**

- Debe pasar todas las comprobaciones AXE.
- Debe cumplir los mínimos WCAG AA: gestión de foco, contraste de color,
  atributos ARIA.

**Componentes:**

- Mantenerlos pequeños y centrados en una única responsabilidad.
- Buscar siempre la reutilización de componentes y lógica cuando exista una
  responsabilidad común estable. Componer primitivas pequeñas en vez de
  duplicar implementaciones o crear componentes universales llenos de opciones.
- Una abstracción compartida debe tener un contrato claro y no conocer modelos
  de dominio. Las piezas reutilizables de una sola feature permanecen dentro de
  esa feature; solo pasan a `shared/` cuando su uso sea transversal.
- Las reglas de negocio tienen una única implementación en el dominio o store
  correspondiente; las pantallas no mantienen variantes de la misma lógica.
- Usar `input()` y `output()` en lugar de decoradores.
- Usar `computed()` para estado derivado.
- Establecer `changeDetection: ChangeDetectionStrategy.OnPush`.
- Preferir templates inline para componentes pequeños.
- Preferir Reactive Forms sobre Template-driven.
- NO usar `ngClass` ni `ngStyle`; usar bindings de `class`/`style`.
- Al usar templates/estilos externos, usar rutas relativas al fichero TS del
  componente.

**Gestión de estado:**

- Usar signals para estado local de componente.
- Usar `computed()` para estado derivado.
- Mantener las transformaciones de estado puras y predecibles.
- NO usar `mutate` en signals; usar `update` o `set`.

**Templates:**

- Mantenerlos simples, evitar lógica compleja.
- Usar control flow nativo (`@if`, `@for`, `@switch`) en lugar de `*ngIf`,
  `*ngFor`, `*ngSwitch`.
- Usar el `async` pipe para observables.
- No asumir que los globales (p. ej. `new Date()`) están disponibles.

**Servicios:**

- Diseñarlos con una única responsabilidad.
- Usar `providedIn: 'root'` para singletons.
- Usar `inject()` en lugar de inyección por constructor.

### 3. Versionado y despliegue

- Versionado semántico (SemVer) en `package.json`, única fuente de la versión
  visible y de los metadatos de actualización de la PWA.
- Antes de cada despliegue, acordar con el usuario el incremento y el número
  exacto: `major` para cambios incompatibles, `minor` para funcionalidades
  compatibles y `patch` para correcciones compatibles. No inferir el consenso
  por silencio ni incrementar o publicar sin él. Registrar el acuerdo en la PR.
- Desplegar significa hacer push del cambio con la versión acordada ya
  modificada. La integración Git de Vercel crea Preview para ramas de trabajo y
  Production al integrar mediante squash en `main`; no usar despliegues manuales
  por CLI/MCP ni promover una Preview construida con recursos de desarrollo.
- Después de publicar, usar el MCP de Vercel para localizar el despliegue del SHA
  exacto y comprobar destino, URL, estado y logs. Ante un fallo, **avisar con un
  reporte y detenerse**: no corregir, reintentar, redesplegar ni ejecutar rollback
  por iniciativa propia. Cualquier recuperación requiere una nueva instrucción.
- Repositorio Git local en la rama `main`, enlazado como `origin` a
  `https://github.com/danielperezmartinez/outify`.
- `main` es la rama estable y se protege contra force-push. El trabajo se hace
  en ramas cortas `feat/*`, `fix/*`, `chore/*` o `docs/*`, se integra mediante
  pull request y squash, y usa Conventional Commits.
- Destino de despliegue: el proyecto Vercel `outify`, ya conectado a GitHub,
  con producción en `https://outify.vercel.app`. CI comprueba instalación
  reproducible, incremento SemVer, tests, PWA y builds de Preview y Production.
- `main` requiere PR, historial lineal y el check `Verificar` actualizado;
  la protección también se aplica a administradores. Solo se admite squash.
- Fuentes y justificación:
  [[Decisiones/ADR-0010 Publicaciones acordadas y CI-CD mediante Git]] y
  [[Decisiones/ADR-0008 Flujo Git con ramas cortas y squash]].

### 4. Idioma

- Código (identificadores, nombres de variables/funciones/componentes):
  **inglés**.
- Comentarios de código y toda la documentación (incluida esta bóveda):
  **español**.

## Propósito del proyecto

Outify es una aplicación para llevar un inventario visual de la ropa y saber
dónde está guardada. Cada usuario podrá representar uno o varios armarios en un
canvas mediante formas geométricas sencillas y organizar visualmente sus prendas
en ellos mediante interacciones intuitivas como arrastrar y soltar.

La aplicación contará además con un inventario de prendas. Cada prenda tendrá
una ficha propia con, como mínimo, una imagen y una descripción; sus demás datos
se concretarán al definir el alcance funcional. El objetivo es unir el catálogo
de ropa con la representación espacial de los armarios para que el usuario pueda
consultar qué tiene y en qué lugar se encuentra.

El alcance, las pantallas y los campos funcionales del primer MVP se definen en
[[Producto]].

## Arquitectura objetivo

La aplicación usa una arquitectura orientada a features y flujos de usuario,
no carpetas globales separadas por tipo técnico. La estructura objetivo es:

```text
src/app/
├── platform/                 # sesión, Supabase, guards y shell de aplicación
├── wardrobes/                # consulta y edición de armarios
│   ├── wardrobe-canvas/
│   │   ├── engine/           # TypeScript puro, sin dependencias de Angular
│   │   ├── viewport/         # adaptación SVG y eventos de entrada
│   │   └── toolbar/          # controles del editor
│   ├── wardrobe-view/
│   ├── wardrobe-edit/
│   ├── wardrobe-data/
│   └── wardrobes.routes.ts
├── inventory/                # lista y formulario de artículos
│   ├── item-list/
│   ├── item-form/
│   ├── item-data/
│   └── inventory.routes.ts
├── account/                  # perfil y cierre de sesión
└── shared/                   # primitivas estables y transversales, sin dominio
    ├── ui/
    └── utilities/
```

- Todas las rutas de feature se cargan de forma diferida y usan componentes
  standalone.
- El estado mutable se encapsula en stores de Signals con alcance de feature o
  ruta; se exponen Signals de solo lectura y valores derivados con `computed()`.
- Los `effect()` se reservan para sincronizar con límites externos. La lógica de
  negocio y las transformaciones permanecen puras y testeables.
- El motor del editor es TypeScript independiente de Angular. Angular adapta su
  estado a la interfaz, pero no interviene en cada movimiento del puntero.
- Los eventos de alta frecuencia se agrupan por frame; los Signals reciben el
  estado confirmado al terminar una operación o cuando la UI necesita
  reaccionar, evitando change detection y asignaciones por cada `pointermove`.
- La composición y la reutilización tienen prioridad sobre duplicar componentes
  o bifurcar reglas. No se crean abstracciones especulativas: se extraen cuando
  la responsabilidad común y su contrato están claros.

Véanse [[Decisiones/ADR-0005 Arquitectura Angular orientada a features]] y
[[Decisiones/ADR-0006 Motor de edición con SVG nativo]].
