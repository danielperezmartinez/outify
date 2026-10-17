---
Nombre: Publicación separada de código y bóveda
Número: 13
Estado: Aceptada
Resumen: El código se publica siempre por PR con los checks de seguridad en verde y subida SemVer; los cambios que solo tocan docs/ se publican con push directo a main, sin versión ni despliegue.
Decisión: Separar la publicación de código (PR, squash, versión y despliegue verificado) de la de la bóveda (push directo a main sin build).
Consecuencias: La bóveda deja de esperar a una PR con versión y no consume builds; la norma de no subir código directo a main depende del README porque la protección no se aplica a administradores.
Reemplaza: "[[ADR-0008 Flujo Git con ramas cortas y squash]]; [[ADR-0010 Publicaciones acordadas y CI-CD mediante Git]]"
Reemplazada por: []
Fecha de creación: 2026-10-17
Última modificación: 2026-10-17
---

# ADR-0013 · Publicación separada de código y bóveda

## Contexto

Con [[ADR-0008 Flujo Git con ramas cortas y squash|ADR-0008]] y
[[ADR-0010 Publicaciones acordadas y CI-CD mediante Git|ADR-0010]] todo cambio
llegaba a `main` por PR y cada PR subía la versión, también los que solo
actualizaban la bóveda. Las notas se quedaban en ramas locales esperando a la
siguiente PR de código, o forzaban una versión y un despliegue que no cambiaban
nada para el usuario. Tras el sistema de seguridad v2, `main` exige los checks
`Verificar`, `Seguridad` y `Fugas`. El usuario y los agentes trabajan con la
misma cuenta de GitHub, que es administradora.

El usuario acordó este flujo el 2026-10-17 para todos sus repositorios, primero
en nocendland y después en outify.

## Decisión

La regla operativa tiene una única fuente:
[[../README#3. Publicación: el código va por pull request y todo despliegue se verifica|la regla 3 del README]].
En resumen:

- **Código** (cualquier archivo fuera de `docs/`, o un cambio mixto): rama
  corta, Conventional Commits, PR contra `main` con subida SemVer acordada,
  checks obligatorios en verde, squash y despliegue verificado en Vercel. Se
  mantienen de ADR-0008 las ramas cortas, el squash y el historial lineal, y de
  ADR-0010 el consenso de versión, la integración Git de Vercel como único
  mecanismo de despliegue y la ausencia de recuperación automática.
- **Solo bóveda** (`docs/`): commit y push directo a `main`, sin versión ni
  despliegue.
- La protección de `main` exige `Verificar`, `Seguridad` y `Fugas` en modo
  estricto, con `enforce_admins` desactivado para que la cuenta administradora
  pueda publicar la bóveda directamente. No subir código directo a `main` es
  una norma del README, no un bloqueo técnico.
- `vercel.json` define un `ignoreCommand` que omite la build si el commit no
  cambia nada fuera de `docs/`. El job `Cambios` del CI omite `Verificar` y
  `Seguridad` en ese caso; `Fugas` se ejecuta siempre, porque la bóveda también
  es pública.

## Alternativas consideradas

- Mantener la PR obligatoria para todo: descartada; obliga a subir versión o a
  acumular notas sin publicar.
- PR de solo bóveda sin subir versión: descartada; añade espera de CI y
  aprobación a cambios que no se despliegan.
- `enforce_admins` activado con una excepción por ruta: GitHub no permite
  proteger una rama solo para algunas rutas.

## Consecuencias

- Positivas: la bóveda se mantiene al día sin coste de builds; cada versión
  publicada corresponde a un cambio de código.
- Negativas / compromisos: un push directo de código a `main` es técnicamente
  posible y se desplegaría sin esperar al CI, así que depende de que personas y
  agentes cumplan la regla. Un push de solo bóveda no pasa por PR, por lo que
  los hooks locales de gitleaks y el job `Fugas` son su única revisión.

## Decisiones relacionadas

- [[ADR-0008 Flujo Git con ramas cortas y squash]] (reemplazada)
- [[ADR-0010 Publicaciones acordadas y CI-CD mediante Git]] (reemplazada)
