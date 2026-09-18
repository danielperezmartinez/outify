---
Nombre: Actualizaciones de la aplicación
Tipo: Servicio y componentes
Área: Platform
Feature: PWA
Estado: Vigente
Ámbito: Transversal
Resumen: AppUpdates encapsula disponibilidad, aplazamiento, comprobación y recuperación del service worker; VersionButton y UpdateNotice ofrecen la interfaz compartida.
Fuente: src/app/platform/app-updates.ts
Entrada pública: AppUpdates; VersionButton; UpdateNotice
Última modificación: 2026-09-18
---

# Actualizaciones de la aplicación

La implementación es la fuente de verdad. `AppUpdates` expone Signals de solo
lectura; `check(true)` comprueba y recupera un aviso aplazado; `dismiss()` lo oculta
y `reload()` recarga con las protecciones del navegador. `VersionButton` se usa
en login y shell; `UpdateNotice` vive una sola vez en la raíz.

`scripts/configure.mjs` genera `app-version.ts` y `ngsw-config.json` a partir de
`package.json` y `ngsw-config.template.json`; los generados no se versionan.

Véase [[Decisiones/ADR-0011 PWA y actualización voluntaria]].
