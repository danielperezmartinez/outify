---
Nombre: Guarda técnica y política común de publicación
Número: 14
Estado: Aceptada
Resumen: Outify adopta la política común de publicación de las webs del usuario; el código va siempre por PR con squash, versión aprobada y checks strict, la bóveda por push directo, y una guarda en pre-push bloquea el código directo a main.
Decisión: Aplicar la política común (squash, protección sin resolver conversaciones, Dependabot como código patch, integración solo con autorización) y convertir en bloqueo técnico local la prohibición de subir código directo a main.
Consecuencias: Subir código directo a main deja de depender solo de la norma escrita; la regla vive únicamente en la sección Publicación del README y las conversaciones abiertas ya no impiden integrar una PR.
Reemplaza: "[[ADR-0013 Publicación separada de código y bóveda]]"
Reemplazada por: []
Fecha de creación: 2026-10-17
Última modificación: 2026-10-17
---

# ADR-0014 · Guarda técnica y política común de publicación

## Contexto

[[ADR-0013 Publicación separada de código y bóveda|ADR-0013]] separó la
publicación de código (PR) de la de la bóveda (push directo) y dejó la
prohibición de subir código directo a `main` como norma escrita, porque la
protección no se aplica a administradores (`enforce_admins=false`) y el usuario
y los agentes comparten la cuenta administradora.

El 2026-10-17 el usuario fijó una política de publicación idéntica para sus
cuatro webs, y la skill que mantiene la bóveda incorporó el sistema
Publicación, con una guarda local en `pre-push`.

## Decisión

La regla operativa tiene una única fuente:
[[../README#Publicación|la sección Publicación del README]]. Respecto a
ADR-0013 cambia lo siguiente:

- `.githooks/pre-push` carga `.githooks/_rama_principal.sh`, que rechaza un push
  a `main` con cambios fuera de `docs/`. Deja de ser solo una norma.
- La protección de `main` deja de exigir resolver las conversaciones.
- Las PR de Dependabot son código: el agente añade la subida `patch` y las
  integra con autorización.
- El agente propone el incremento de versión y el usuario lo aprueba antes de
  abrir la PR; `major` siempre con autorización expresa.

Se mantiene el resto de ADR-0013: squash, historial lineal, checks
`Verificar`, `Seguridad` y `Fugas` strict, `enforce_admins=false`,
`ignoreCommand` de Vercel y job `Cambios` del CI.

## Alternativas consideradas

- Mantener la norma solo escrita: descartada; un error de un agente desplegaría
  código sin esperar al CI.
- `enforce_admins=true` y bóveda por PR: descartada en ADR-0013 por el coste de
  una PR con versión por cada nota.

## Consecuencias

- Positivas: el mismo flujo en las cuatro webs; el código directo a `main` se
  bloquea antes de salir del equipo.
- Negativas / compromisos: la guarda es local; un clon sin `core.hooksPath`
  activo (lo activa el script `prepare`) o un `--no-verify` la saltan, y en ese
  caso solo queda la norma.

## Decisiones relacionadas

- [[ADR-0013 Publicación separada de código y bóveda]] (reemplazada)
