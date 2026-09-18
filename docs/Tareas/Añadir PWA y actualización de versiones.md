---
Nombre: Añadir PWA y actualización de versiones
Estado: En curso
Resumen: PWA, versión discreta y aviso voluntario implementados y verificados; versión 0.2.0 minor autorizada, pendiente de confirmar su publicación mediante MCP de Vercel.
Decisiones: "[[Decisiones/ADR-0010 Publicaciones acordadas y CI-CD mediante Git]]; [[Decisiones/ADR-0011 PWA y actualización voluntaria]]"
Bloqueada: []
Fecha de creación: 2026-09-18
Última modificación: 2026-09-18
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
- [ ] Publicación con versión acordada y estado confirmado mediante MCP de Vercel.

Resultados locales del 2026-09-18: 17 tests Angular, 6 tests de configuración y
SemVer y 1 escenario Playwright satisfactorios. Instalación frozen y builds con
recursos de desarrollo y producción correctos; formato y diff revisados. Chrome
no informa de errores de instalabilidad del manifest (la prueba usa un contexto
incógnito y excluye únicamente esa limitación del navegador).

El usuario autorizó publicar la versión propuesta `0.2.0` (minor) el 2026-09-18,
después de pedir confirmación de que el consenso está documentado en las normas.
`package.json` actualizado; publicación en curso mediante PR y squash.

## Relación con otras tareas

- [[Automatizar CI-CD y previews en Vercel]] integra la validación automática.
- [[Definir identidad pública de Outify]] conserva el diseño definitivo de los iconos.
