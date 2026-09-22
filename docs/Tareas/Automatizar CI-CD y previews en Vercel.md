---
Nombre: Automatizar CI-CD y previews en Vercel
Estado: Hecha
Resumen: CI validado en PR y main; Preview y Production 0.2.0 READY confirmados por MCP, con main protegida, squash exclusivo y consenso SemVer documentado.
Decisiones: "[[Decisiones/ADR-0003 pnpm exclusivo y seguridad de dependencias|ADR-0003]]; [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel|ADR-0007]]; [[Decisiones/ADR-0008 Flujo Git con ramas cortas y squash|ADR-0008]]; [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase|ADR-0009]]"
Bloqueada: []
Fecha de creación: 2026-09-18T14:27:30+02:00
Última modificación: 2026-09-19
---

# Automatizar CI-CD y previews en Vercel

## Objetivo

Convertir el flujo Git aceptado en un proceso reproducible que valide cada pull
request, genere una Preview segura y despliegue `main` en producción sin pasos
manuales innecesarios.

El usuario conectó GitHub y completó el primer despliegue manual en Vercel
el 2026-09-18: `https://outify.vercel.app`.

## Alcance

- Configurar checks de pull request con pnpm 12.4.2.
- Ejecutar `pnpm install --frozen-lockfile`, tests y build de producción.
- Conectar las previews de Vercel a `outify_dev` y al bucket de desarrollo.
- Conectar Vercel Production a `outify` y al bucket estable.
- Definir checks obligatorios, protección de `main` y política de squash.
- Documentar promoción, rollback, variables por entorno y diagnóstico de fallos.
- Mantener secretos y credenciales fuera del repositorio.

## Criterios de finalización

- [x] Cada pull request obtiene un resultado verificable de tests y build.
- [x] Cada pull request elegible obtiene una URL Preview.
- [x] La configuración de Preview selecciona exclusivamente recursos de desarrollo, verificada mediante pruebas de precedencia.
- [x] Solo `main` despliega en Production.
- [x] La protección de rama exige el check `Verificar` actualizado, también para administradores (API de GitHub).
- [x] Existe un ensayo local documentado de restauración; no se ha ejecutado rollback en producción.

## Fuera de alcance

- Cambiar la plataforma Vercel.
- Crear un segundo proyecto Supabase mientras se mantenga la restricción de
  coste actual.

## Base preparada por el MVP

`vercel.json` define instalación reproducible, build, rutas SPA y cabeceras.
`scripts/configure.mjs` selecciona automáticamente producción con `VERCEL_ENV=production`
y desarrollo en Preview. La conexión inicial ya está hecha.

## Implementación de CI/CD

- `.github/workflows/ci.yml`: PR a `main` y push a `main`; permisos de lectura,
  Node 24, pnpm 12.4.2, instalación frozen, SemVer, tests, PWA, build Preview y
  build Production. Actions fijadas por SHA. Sin secretos de cuentas ni de Vercel.
- Configuración remota aplicada y leída mediante API de GitHub: squash exclusivo,
  borrado de ramas tras integrar, `main` con historial lineal, prohibición de
  force-push/borrado y requisito del check `Verificar` actualizado. Cero revisiones
  obligatorias para permitir el flujo del propietario único.
- Vercel identificado por MCP: proyecto `prj_szp42yXWRAcl4hPaOLsnEvFPTBZA`, equipo
  `team_pg6J2nXKfiXk3LNIcM2QVWnB`; producción inicial `READY`, commit `d2b593e`.
- Protocolo y autoridad: [[Decisiones/ADR-0010 Publicaciones acordadas y CI-CD mediante Git]]
  y [[../README#3. Versionado y despliegue]].

## Validación y publicación completadas

La rama `feat/pwa-cicd` se publicó con la versión acordada mediante
[PR #1](https://github.com/danielperezmartinez/outify/pull/1), integrada por squash
tras CI y Preview correctos. Evidencia confirmada el 2026-09-19:

- CI de la PR: [35390248695](https://github.com/danielperezmartinez/outify/actions/runs/35390248695), `success`.
- Preview del SHA `24ba2e250a6a734876a281b0a60ac5411e67234a`:
  `dpl_7gkHsDp42DSMg6nqLhDErvnCuKVV`, `READY` por MCP, logs de build correctos.
  URL: `https://outify-1wqoxlq5y-devappsdpms-projects.vercel.app`.
- CI de `main`: [35390559820](https://github.com/danielperezmartinez/outify/actions/runs/35390559820), `success`.
- Production del SHA `4be7608f46e060daf0c7e16b2afd14807e26a17d`:
  `dpl_DAEScmktmD5Za3wpBcK4oZ28rxTa`, `READY` por MCP, `target=production`,
  `source=git`, `githubCommitRef=main`, alias `https://outify.vercel.app` y sin
  error de alias. `/ngsw.json` público devuelve HTTP 200 y versión `0.2.0`.
- Logs runtime de errores/fatales consultados por MCP: sin entradas para el
  despliegue en las últimas 24 horas. La API MCP de logs de build no estaba
  disponible en la comprobación final («Tool get_deployment_build_logs not found»).
  No se declara revisado ese log de Production ni los errores del navegador.

Las previews permiten verificar la PWA y la pantalla de acceso. Para probar OAuth
en un alias Preview, añadir su callback exacto en Supabase conservando las URLs
existentes; no se han cambiado las URLs de Auth del proyecto compartido.

Verificación local satisfactoria: instalación frozen, 17 tests Angular, 6 tests
de configuración/SemVer, 1 escenario PWA con AXE y builds de ambos entornos.
El usuario autorizó publicar la versión propuesta `0.2.0` (minor) el 2026-09-18,
previa confirmación del consenso documentado. CI, Preview y Production quedaron
verificados; no se requirieron correcciones, reintentos ni rollback.

## Restauración y diagnóstico

No se ejecuta ninguna recuperación automáticamente. Ante fallo, recoger mediante
MCP ID, SHA, entorno, URL, estado, etapa y extracto relevante de logs, y reportar
sin cambios posteriores.

Si el propietario solicita restauración, recuperar el código del commit estable
en una rama nueva y acordar un nuevo incremento SemVer. Publicarlo mediante el
mismo flujo PR/checks/squash; la versión nueva permite al worker avisar incluso
cuando se ha recuperado código anterior. No promover una Preview con datos de
desarrollo ni reinstalar silenciosamente el mismo manifest de una versión previa.

El ensayo de restauración es local en `e2e/pwa.spec.ts`; no se ha hecho rollback
en producción. La prueba simula dos manifests nuevos sucesivos y recupera el HTML
anterior bajo otra versión, conservando el proceso de aceptación por el usuario.
