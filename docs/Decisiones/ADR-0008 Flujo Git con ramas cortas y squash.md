---
Nombre: Flujo Git con ramas cortas y squash
Número: 8
Estado: Aceptada
Resumen: El desarrollo parte de main estable, usa ramas cortas por cambio y se integra mediante pull request con squash y comprobaciones previas.
Decisión: Proteger main y trabajar con ramas feat, fix, chore o docs, Conventional Commits y squash merge.
Consecuencias: "El historial principal queda lineal y revisable, a cambio de requerir pull requests incluso en un equipo pequeño y automatizar sus comprobaciones más adelante."
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-18T14:27:30+02:00
Última modificación: 2026-09-18T14:27:30+02:00
---

# ADR-0008 · Flujo Git con ramas cortas y squash

## Contexto

El repositorio local ya usa `main` y está enlazado con GitHub, pero faltaba
definir cómo se integrarán los cambios. Outify necesita un flujo sencillo para
una etapa temprana que mantenga `main` desplegable y permita añadir revisiones y
checks sin introducir ramas de larga duración.

## Decisión

- `main` es la única rama estable y potencialmente desplegable.
- Se prohíbe el force-push sobre `main` una vez publicada en GitHub.
- Cada cambio no trivial se desarrolla en una rama corta con uno de estos
  prefijos: `feat/`, `fix/`, `chore/` o `docs/`.
- Los cambios se integran mediante pull request y `squash merge`; la rama se
  elimina después de integrar.
- Los commits siguen Conventional Commits. Como mínimo se usan `feat`, `fix`,
  `docs`, `test`, `refactor`, `chore`, `build` y `ci`.
- Antes de integrar deben pasar instalación reproducible, tests y build. Al
  principio pueden ejecutarse localmente; la automatización se realizará en
  [[Tareas/Automatizar CI-CD y previews en Vercel]].
- El commit inicial de arranque es la única excepción natural al pull request,
  porque el remoto todavía no dispone de una rama base.

## Alternativas consideradas

- Commits directos habituales sobre `main` — descartados porque impiden una
  revisión clara y dificultan añadir checks obligatorios.
- Git Flow con ramas `develop` y `release` — descartado por exceso de ceremonia
  para el tamaño y madurez actual del proyecto.
- Merge commits — descartados en favor de un historial principal lineal con un
  commit por cambio integrado.

## Consecuencias

- Positivas: historial limpio, cambios aislados, reversión sencilla y encaje
  directo con previews de Vercel.
- Negativas / compromisos: las ramas deben ser pequeñas y el título final del
  pull request debe describir bien el cambio que quedará en `main`.

## Decisiones relacionadas

- [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel]]

## Tareas relacionadas

- [[Tareas/Automatizar CI-CD y previews en Vercel]]
