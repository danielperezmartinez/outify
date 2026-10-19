---
Última modificación: 2026-10-19
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
  [[Decisiones/ADR-0011 PWA y actualización voluntaria]],
  [[Decisiones/ADR-0012 Composición persistente de outfits]],
  [[Decisiones/ADR-0013 Publicación separada de código y bóveda]] y
  [[Decisiones/ADR-0014 Guarda técnica y política común de publicación]].

[[Decisiones|Abrir decisiones de arquitectura]]

### Seguridad, coste y cumplimiento

_Versión del sistema: 3._

Carpeta [[Seguridad/Seguridad.base|Seguridad/]]: excepciones justificadas a estas
reglas, la [[Seguridad/Checklist de lanzamiento|checklist de lanzamiento]] y las
referencias opacas a hallazgos privados.
Estas reglas aplican a todo cambio, lo haga una persona o un agente, y también a
lo que se haga con MCP, CLI o panel.

#### Backend y datos (Supabase)

- **RLS activado no basta.** Cada política expresa quién puede hacer qué sobre
  qué filas; lo normal es `owner_id = (select auth.uid())`.
- Prohibido `USING (true)` o `WITH CHECK (true)` en políticas de `INSERT`,
  `UPDATE`, `DELETE` o `ALL`. En `SELECT` solo con una excepción escrita en
  `Seguridad/` y referenciada en la política
  (`comment on policy … is 'excepcion: <nombre de la nota>'`).
- Los datos compartidos por enlace se sirven con una función RPC que recibe el
  token y devuelve solo esa fila. La tabla nunca es listable por `anon`.
- Las funciones `SECURITY DEFINER` llevan `set search_path = ''` y nombres
  cualificados con esquema, y se revoca `EXECUTE` a `anon` (y a `public`) salvo
  excepción escrita. Si no necesitan saltarse RLS, se usa `SECURITY INVOKER`.
- Las extensiones con efectos fuera de la base de datos (`pg_net`, `http`) quedan
  fuera del alcance de `anon` y `authenticated`.
- Los esquemas expuestos por la API son los mínimos. Lo interno vive en un
  esquema `*_private` no expuesto.
- **Todo el DDL** (tablas, políticas, funciones, grants, buckets y sus límites)
  vive en migraciones versionadas del repo. Nada se hace solo en el panel ni solo
  por MCP; si se hizo, se vuelca a una migración en el mismo cambio.
- "El Security Advisor no da avisos" **no** cuenta como verificación. La
  verificación son los tests de `supabase/tests/` (ver "Comprobaciones").

#### Coste y abuso

- Todo lo que un usuario puede crear tiene **tope de tamaño y de cantidad**:
  buckets con `file_size_limit` y `allowed_mime_types`, cuota por usuario
  (comprobada en la política de Storage o en un trigger), `CHECK` de longitud en
  columnas de texto y tope de filas por usuario en tablas que crecen.
- Nada de llamadas recursivas ni bucles sin tope: triggers que llaman a funciones
  HTTP, funciones que se invocan a sí mismas, reintentos sin límite, efectos del
  cliente que se disparan en bucle. Todo reintento tiene un máximo y espera entre
  intentos.
- Los endpoints públicos (funciones serverless, Edge Functions, RPC accesibles a
  `anon`) tienen límite de peticiones.
- Este proyecto comparte el proyecto Supabase `devappsdpm-db` (plan gratuito:
  Auth, Storage de 1 GB, base de datos de 500 MB, egress y la configuración
  `pgrst.db_schemas` de PostgREST) con gift-card, nocendland y perro-sanxe.
  Agotar Auth, Storage o la cuota del plan aquí deja sin servicio a todas:
  cualquier límite se diseña pensando en el conjunto.

#### Secretos

- La clave publicable (`anon` / `sb_publishable_…`) puede ir en el cliente.
- La clave secreta (`service_role` / `sb_secret_…`) y cualquier otro secreto solo
  viven en el servidor o en el CI, nunca en el código del cliente ni en el repo.
- Cada secreto está solo en los entornos que lo necesitan (p. ej. Production y no
  Preview si las previews no lo usan), marcado como sensible donde la plataforma
  lo permita.
- Los ficheros de secretos locales (`.env*` salvo `.env.example`, keystores,
  claves) están en `.gitignore`.

#### Repositorio y publicación

- Todo lo que se sube queda expuesto y **no se puede retirar**: el código, esta
  bóveda `docs/`, los mensajes de commit, los nombres de rama, los títulos y
  cuerpos de PR, las issues, los workflows, los logs y artefactos de CI. Borrarlo
  después no lo quita del historial, de los forks ni de las cachés.
- **Nunca se sube:**
  - Secretos: claves, contraseñas, tokens, ficheros `.env`, keystores.
  - Datos del entorno personal: nombres de host, de máquina o de dispositivo,
    usuarios del sistema operativo, IP (de red local, VPN o públicas), dominios y
    redes propios, rutas personales (`C:\Users\<nombre>`, `/home/<nombre>`,
    unidades y carpetas propias) y correos personales.
  - Vulnerabilidades sin corregir (ver "Vulnerabilidades y hallazgos sensibles").
- En la documentación se usan **marcadores genéricos** (`<usuario>`,
  `<host-de-pruebas>`, `<ruta-al-proyecto>`). Los valores reales viven fuera del
  repo: variables de entorno, la memoria local del agente (que no se versiona) o
  el fichero de patrones personales.
- **Antes de cada commit y de cada push** se revisan el diff y los mensajes. Los
  hooks versionados en `.githooks/` lo comprueban con gitleaks (patrones
  genéricos de `.gitleaks.toml` y patrones personales fuera del repo), y el CI lo
  repite. Los hooks no se saltan (`--no-verify`) sin permiso explícito del
  usuario. Un falso positivo se resuelve ajustando el patrón o con
  `gitleaks:allow` en esa línea, nunca desactivando la revisión.
- Los logs de CI no imprimen secretos ni datos personales. Los secretos de CI van
  en los secretos de la plataforma (GitHub Secrets), y el CI no depende de
  máquinas, redes ni cuentas personales del usuario.
- **Si algo sensible llega a subirse:** se avisa al usuario **de inmediato**. No
  se reescribe el historial ni se fuerza un push sin su permiso explícito. Si era
  un secreto, se da por comprometido y se revoca o se rota, aunque se borre del
  repo.

#### Vulnerabilidades y hallazgos sensibles

- **Criterio.** Un hallazgo es sensible si describe cómo dañar, espiar o engañar
  a usuarios de la versión publicada y todavía no hay una versión publicada que
  lo corrija. Ante la duda, es sensible.
- **Dónde vive.** Cada hallazgo sensible es un **aviso privado de GitHub**
  (*Security Advisory* en borrador, pestaña *Security* del repo), uno por
  hallazgo. Es su única fuente de verdad mientras no se publique.
- **Qué nunca lo cuenta** mientras no se publique el arreglo: esta bóveda, los
  mensajes de commit, los nombres de rama, los títulos y cuerpos de PR, las
  issues, los comentarios de código y los nombres de test.
- **En la bóveda** solo hay una referencia opaca: una nota `SEC-AAAA-NN`
  (correlativo por año, no se reutiliza) de tipo `Hallazgo` en `Seguridad/`, con
  severidad, estado, el ID `GHSA-…` del aviso y la versión que lo corrige. Nunca
  un título ni una descripción.
- **El arreglo** se prepara en local, con mensajes de commit, nombres de rama y
  nombres de test neutros que no expliquen el fallo, y se sube junto con la
  publicación de la versión que lo corrige. Entonces se publica el aviso y la
  nota pasa a `Publicado`; desde ese momento ya se puede describir.
- **Los agentes no crean, publican ni cierran avisos por su cuenta.** Preparan el
  borrador del aviso y el usuario lo da de alta, o lo autoriza en esa sesión.
  Publicar un aviso es irreversible.
- Lo no sensible (endurecimiento, CVE públicos de dependencias) se gestiona con
  tareas normales.
- Estados de las notas `Hallazgo`: `Abierto` · `Corregido` · `Publicado` ·
  `Descartado`. `Corregido` significa que el arreglo está listo pero aún no
  publicado: sigue siendo sensible. Al pasar a `Publicado` (arreglo y aviso
  publicados por el usuario), la nota ya puede enlazar el aviso y describir el
  fallo.

#### Legal y privacidad (UE / España)

> Estas reglas resumen obligaciones habituales y no son asesoramiento legal. Ante
> dudas concretas, consulta a un profesional.

- Antes de publicar: **aviso legal** (LSSI-CE, art. 10) y **política de
  privacidad** (RGPD, art. 13), enlazados desde todas las páginas.
- No se envían datos personales ni la ubicación a terceros (APIs de mapas, de
  analítica, de IA…) sin avisar antes en la interfaz y sin una acción explícita
  del usuario que lo dispare. Cada tercero que reciba datos aparece en la
  política de privacidad.
- Las comunicaciones comerciales (emails, notificaciones push) requieren
  consentimiento expreso, separado de aceptar los términos, y una forma sencilla
  de darse de baja.
- El banner de cookies solo es necesario si hay cookies o almacenamiento no
  técnicos (analítica, publicidad, terceros). Si existe, rechazar es tan fácil
  como aceptar y nada no técnico se carga antes del consentimiento.

#### Accesibilidad

- Objetivo: **WCAG 2.2 nivel AA**. AXE en el CI sin infracciones; además,
  revisión manual de teclado y foco en los flujos nuevos (AXE no detecta todo).

#### Comprobaciones y compuerta de "Hecha"

- Comprobaciones del proyecto: tests pgTAP de `supabase/tests/security/`
  (`catalog.test.sql`, `isolation.test.sql` y `limits.test.sql`), ejecutados con
  `supabase test db supabase/tests/security` sobre una base local construida con
  las migraciones, en el job `Seguridad` de `.github/workflows/ci.yml`; AXE en
  `e2e/public.spec.ts`, `e2e/editor.spec.ts` y `e2e/outfits.spec.ts`
  (`pnpm test:editor`, job `Verificar`), y el paso "Sin secretos en el bundle"
  tras el build de Production; gitleaks en los hooks de `.githooks/` y en el
  job `Fugas`. Las suites SQL funcionales anteriores de `supabase/tests/*.sql`
  siguen vigentes.
- **Una tarea que toque backend o UI no pasa a `Hecha`** hasta que esas
  comprobaciones estén en verde, y su sección "Verificación" lo deja escrito (qué
  se ejecutó y dónde). Si el cambio añade tablas, políticas, funciones o rutas,
  añade también su test en el mismo cambio.
- **Ninguna tarea pasa a `Hecha` con commits sin revisar:** los hooks de gitleaks
  han pasado en cada commit y push, y el job de fugas del CI está en verde.
- Una excepción a estas reglas es una nota `Excepción` en `Seguridad/` con su
  justificación. Sin nota, no hay excepción.
- Sus jobs son checks obligatorios para integrar en la rama principal; el flujo
  de publicación está en la sección [[#Publicación]] y no se repite aquí.

### Publicación

_Versión del sistema: 1._

Esta es la única regla de publicación del proyecto (política común de las webs
del usuario); las demás secciones, la plantilla de PR y los workflows la
enlazan en vez de repetirla.

| Cambio | Cómo se publica | Versión | Despliegue |
| --- | --- | --- | --- |
| **Código**: cualquier archivo fuera de `docs/` | Rama corta y pull request contra `main`, integrada con squash | Sube en la propia PR | Production al integrar en `main` |
| **Solo bóveda**: todo dentro de `docs/` | Commit y push directo a `main` | No cambia | Ninguno: Vercel lo omite con `ignoreCommand` |

- Un commit o una PR que mezcle bóveda y código cuenta como **código**.
- **Nunca se hace push directo de código a `main`**, aunque GitHub lo permita a
  administradores. La guarda de `.githooks/pre-push`
  (`.githooks/_rama_principal.sh`) rechaza un push a `main` que toque algo fuera
  de `docs/`; es la red que cubre `enforce_admins=false` y no se salta
  (`--no-verify`) sin autorización del usuario.
- **Integración: solo squash.** En el repo, merge commit y rebase desactivados,
  `delete_branch_on_merge` activado y auto-merge desactivado.
- **Protección de `main`:** PR obligatoria con 0 aprobaciones; checks
  `Verificar`, `Seguridad` y `Fugas` obligatorios en modo strict; historial
  lineal; **no** se exige resolver las conversaciones; `enforce_admins=false`
  para que el push directo de `docs/` funcione con la cuenta compartida; sin
  force push ni borrado de la rama.
- **Versión:** cada PR de código sube la versión de `package.json` (SemVer),
  única fuente de la versión visible y de los metadatos de actualización de la
  PWA. El agente propone el incremento según los commits (Conventional Commits)
  y **el usuario lo aprueba** antes de abrir la PR; `major`, siempre con
  autorización expresa. El acuerdo queda en la PR. El CI comprueba que la
  versión supera la de `main` (`pnpm check:release` en `Verificar`).
- **Dependabot:** sus PR son código. El agente añade la subida `patch` y la
  integra con autorización, como cualquier otra.
- **Quién integra:** el agente, solo con autorización explícita del usuario
  para esa PR; si no la tiene, se detiene con la PR abierta.
- **Despliegue:** la integración Git de Vercel (proyecto `outify`) crea Preview
  para las ramas y Production (`https://outify.vercel.app`) al integrar en
  `main`; no se usan despliegues manuales por CLI/MCP. Al integrar, se localiza
  con el MCP de Vercel el despliegue del SHA exacto y se verifica que queda en
  `READY`. Si queda en `ERROR`, **se detiene e informa al usuario** sin
  reintentar, redesplegar ni hacer rollback; la corrección es una PR nueva con
  su versión.
- **CI:** el job `Cambios` de `.github/workflows/ci.yml` omite `Verificar` y
  `Seguridad` cuando el cambio solo toca `docs/`; `Fugas` se ejecuta siempre.
- **Migraciones del Supabase compartido** `devappsdpm-db` (con nocendland y
  gift-card): aparte, con autorización expresa, antes de integrar el frontend
  que las necesita y con la versión que registra el historial remoto
  (`list_migrations`); si `apply_migration` asigna otra, se renombra el fichero.
- **Correo:** los commits usan el correo personal (`user.email` global); el
  usuario lo tiene público en GitHub. El historial ya publicado no se reescribe.
- Una tarea de código no pasa a `Hecha` hasta que su PR está integrada y el
  despliegue verificado; su sección "Verificación" anota la PR, el commit y el
  estado del despliegue. Si la PR espera autorización, la tarea sigue `En curso`.
- Fuente y justificación:
  [[Decisiones/ADR-0014 Guarda técnica y política común de publicación]].

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

- Véase [[#Accesibilidad]] en el sistema "Seguridad, coste y cumplimiento"
  (WCAG 2.2 AA, AXE en CI y revisión manual de teclado y foco).

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

### 3. Publicación: el código va por pull request y todo despliegue se verifica

La regla de publicación (código por pull request con versión nueva, bóveda por
push directo y despliegue verificado) vive en la sección del sistema
[[#Publicación]] y no se repite aquí.

### 4. Idioma

- Código (identificadores, nombres de variables/funciones/componentes):
  **inglés**.
- Las rutas de URL y sus parámetros también son código: se escriben en inglés.
  Al renombrarlos se conservan redirecciones de los enlaces publicados.
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
