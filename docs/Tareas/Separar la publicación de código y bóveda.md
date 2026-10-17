---
Nombre: Separar la publicación de código y bóveda
Estado: En curso
Resumen: El código va por PR con checks obligatorios y subida SemVer; la bóveda (docs/) se publica con push directo a main sin build. Pendiente aplicar la protección de main y comprobar el primer push de solo docs/.
Decisiones: "[[Decisiones/ADR-0013 Publicación separada de código y bóveda|ADR-0013]]"
Bloqueada: []
Fecha de creación: 2026-10-17
Última modificación: 2026-10-17
---

# Separar la publicación de código y bóveda

## Objetivo

Aplicar en outify el flujo de publicación acordado con el usuario para todos sus
repositorios (primero en nocendland): una sola regla en
[[../README#3. Publicación: el código va por pull request y todo despliegue se verifica|el README]].

## Alcance

- README: regla 3 reescrita; la sección de seguridad solo la enlaza.
- [[Decisiones/ADR-0013 Publicación separada de código y bóveda|ADR-0013]]
  reemplaza a ADR-0008 y ADR-0010.
- `vercel.json`: `ignoreCommand` que omite la build si no cambia nada fuera de
  `docs/`.
- CI: job `Cambios` que omite `Verificar` y `Seguridad` en cambios de solo
  bóveda; `Fugas` siempre. Sin cancelar el CI de `main` por un push posterior.
- GitHub: protección de `main` con `Verificar`, `Seguridad` y `Fugas`
  estrictos y `enforce_admins` desactivado (cambio de configuración, con
  confirmación del usuario).

## Criterios de finalización

- [ ] PR de código integrada y Production `READY` en Vercel.
- [ ] Protección de `main` aplicada y leída de vuelta por la API.
- [ ] Primer push de solo `docs/`: Vercel omite la build y el CI solo ejecuta
      `Cambios` y `Fugas`.

## Verificación

- Historial de migraciones: `20261017090000_outify_security_limits` coincide
  con la versión del historial remoto de `devappsdpm-db`; no hay que renombrar.
- `remote.origin.push` no está configurado en el checkout local.
