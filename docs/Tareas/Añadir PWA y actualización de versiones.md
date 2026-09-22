---
Nombre: Añadir PWA y actualización de versiones
Estado: Hecha
Resumen: PWA, versión discreta y aviso voluntario publicados en 0.2.0; Production READY confirmado por MCP y manifest público verificado, con CI y pruebas locales satisfactorios.
Decisiones: "[[Decisiones/ADR-0010 Publicaciones acordadas y CI-CD mediante Git]]; [[Decisiones/ADR-0011 PWA y actualización voluntaria]]"
Bloqueada: []
Fecha de creación: 2026-09-18
Última modificación: 2026-09-19
---

# Añadir PWA y actualización de versiones

## Alcance

Instalación standalone, iconos derivados del favicon provisional, caché del shell,
versión discreta accesible en login y pie de la aplicación, aviso «Actualizar» /
«Más tarde», comprobación manual y periódica. Los datos privados requieren red.

## Verificación

- [x] Build optimizada genera `ngsw.json`, worker y manifest.
- [x] Tests de descarga lista, aplazamiento, comprobación manual, concurrencia y errores.
- [x] Navegador real: instalación del worker, shell offline, actualización voluntaria y restauración local con versión nueva.
- [x] AXE sin incidencias y revisión visual en escritorio (1440 px) y móvil (390 px).
- [x] Publicación con versión acordada y estado confirmado mediante MCP de Vercel.

Resultados locales del 2026-09-18: 17 tests Angular, 6 tests de configuración y
SemVer y 1 escenario Playwright satisfactorios. Instalación frozen y builds con
recursos de desarrollo y producción correctos; formato y diff revisados. Chrome
no informa de errores de instalabilidad del manifest (la prueba usa un contexto
incógnito y excluye únicamente esa limitación del navegador).

El usuario autorizó publicar la versión propuesta `0.2.0` (minor) el 2026-09-18,
después de pedir confirmación de que el consenso está documentado en las normas.
Publicada mediante [PR #1](https://github.com/danielperezmartinez/outify/pull/1)
y squash a `main`, commit `4be7608f46e060daf0c7e16b2afd14807e26a17d`.

Verificación final del 2026-09-19: MCP de Vercel confirma Production `READY`,
despliegue `dpl_DAEScmktmD5Za3wpBcK4oZ28rxTa`, con el SHA exacto y alias
`https://outify.vercel.app`. El manifest público `/ngsw.json` responde HTTP 200,
declara `appData.version = 0.2.0` y mantiene las cabeceras de revalidación.
La consulta de logs runtime de errores/fatales del despliegue no devuelve entradas;
esto no sustituye la observación de errores del navegador. El endpoint MCP de
logs de build devolvió «Tool get_deployment_build_logs not found» en la
comprobación final; no se confunde esa limitación del conector con un fallo de
la publicación. No se hicieron reintentos de despliegue ni correcciones.

## Relación con otras tareas

- [[Automatizar CI-CD y previews en Vercel]] integra la validación automática.
- [[Definir identidad pública de Outify]] conserva el diseño definitivo de los iconos.
