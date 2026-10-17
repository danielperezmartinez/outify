---
Nombre: Separar la publicación de código y bóveda
Estado: Hecha
Resumen: "El código va por PR con checks obligatorios y subida SemVer; la bóveda (docs/) se publica con push directo a main sin build. Verificado el 2026-10-17: PR #7 (v0.4.4) READY, protección de main aplicada y el primer push de solo docs/ no desplegó."
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

- [x] PR de código integrada y Production `READY` en Vercel.
- [x] Protección de `main` aplicada y leída de vuelta por la API.
- [x] Primer push de solo `docs/`: Vercel omite la build y el CI solo ejecuta
      `Cambios` y `Fugas`.

## Verificación

- Historial de migraciones: `20261017090000_outify_security_limits` coincide
  con la versión del historial remoto de `devappsdpm-db`; no hay que renombrar.
- `remote.origin.push` no está configurado en el checkout local.
- PR danielperezmartinez/outify#7 integrada con squash (`5886460`, v0.4.4) con
  `Cambios`, `Verificar`, `Seguridad` y `Fugas` en verde. Production
  `dpl_DZ1wiMkswEBPszSkzSw65iZZ6N2P` `READY` en `https://outify.vercel.app`.
- Protección de `main` aplicada con confirmación del usuario y leída por la API:
  `Verificar`, `Seguridad` y `Fugas` estrictos (GitHub Actions),
  `enforce_admins` desactivado, PR obligatoria con 0 aprobaciones, historial
  lineal, resolución de conversaciones y sin force-push ni borrado.
- Primer push de solo `docs/` (`accbd14`, directo a `main` con la cuenta
  administradora): Vercel lo marcó «Canceled by Ignored Build Step»; en el CI
  `Cambios` y `Fugas` en verde y `Verificar` y `Seguridad` omitidos.
