---
Nombre: Publicaciones acordadas y CI-CD mediante Git
Número: 10
Estado: Aceptada
Resumen: GitHub verifica cada PR y Vercel despliega por Git; cada publicación requiere una versión SemVer acordada y los fallos solo se diagnostican y reportan.
Decisión: Automatizar validaciones y previews manteniendo el consenso humano de versión y la publicación mediante push y squash a main.
Consecuencias: Las previews usan desarrollo, producción se recompila desde main y no hay recuperación automática ante fallos.
Reemplaza: "[[ADR-0007 Repositorio GitHub y despliegue en Vercel]]"
Reemplazada por: []
Fecha de creación: 2026-09-18
Última modificación: 2026-09-18
---

# ADR-0010 · Publicaciones acordadas y CI-CD mediante Git

## Contexto

El primer despliegue ya está operativo. El usuario solicita CI/CD y previews,
consenso de versión y supervisión mediante MCP sin intervenciones ante fallos.

## Decisión

Las reglas operativas tienen una única fuente: [[../README#3. Versionado y despliegue]].
GitHub Actions valida el incremento, la instalación, los tests, la PWA y ambos
builds. La integración Git existente de Vercel publica los commits; no se añade
un segundo mecanismo de despliegue ni tokens de Vercel a GitHub Actions.

La versión se obtiene de `package.json` al configurar la build. El check impide
versiones iguales, decrecientes o saltos que no correspondan a un incremento
major/minor/patch. El check técnico no sustituye el consenso humano registrado
en la PR.

Vercel prevalece sobre `OUTIFY_ENV` para elegir recursos: una Preview siempre
usa desarrollo. Production se recompila desde `main`; promover directamente la
build Preview publicaría la configuración de desarrollo.

## Alternativas consideradas

- CLI de Vercel desde Actions: descartada; duplicaría la integración Git.
- Versionado automático por commits: descartado; el usuario quiere consenso.
- Reintentos o rollback automáticos: descartados por instrucción del usuario.

## Consecuencias

Las verificaciones de CI no necesitan cuentas de prueba ni secretos. Las pruebas
E2E completas del inventario mantienen su configuración separada. Restaurar una
publicación solo se ejecuta por instrucción expresa y siguiendo el mismo flujo.

## Tareas relacionadas

- [[Tareas/Automatizar CI-CD y previews en Vercel]]
- [[Tareas/Añadir PWA y actualización de versiones]]
