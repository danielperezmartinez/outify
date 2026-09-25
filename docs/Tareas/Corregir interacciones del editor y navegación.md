---
Nombre: Corregir interacciones del editor y navegación
Estado: Hecha
Resumen: Correcciones publicadas en 0.3.0; migración de historial aplicada en ambos entornos y pruebas SQL remotas satisfactorias. Producción READY y redirección antigua verificada.
Decisiones: "[[Decisiones visuales]]; [[Catálogo técnico/Editor SVG y armarios]]"
Bloqueada: []
Fecha de creación: 2026-09-19
Última modificación: 2026-09-26
---

# Corregir interacciones del editor y navegación

Solicitud del usuario del 2026-09-19. Trabajo en `feat/editor-launch-preparation`.

- [x] Posición local inmediata al soltar y recuperación visible ante errores.
- [x] Deshacer y rehacer en orden para geometría, propiedades, altas y bajas de zonas.
- [x] Restauración de propiedades y ubicaciones sin pérdida parcial.
- [x] Snap activo por defecto, Mayús durante arrastre y toggle para móvil.
- [x] Menús flotantes con backdrop, cierre exterior y teclado; norma reutilizable.
- [x] Rutas y parámetros en inglés con compatibilidad de enlaces anteriores.
- [x] Pruebas y revisión visual.
- [x] Aplicar migración y verificar la publicación con versión acordada.

Cierre 2026-09-26 (comprobaciones del 25 en UTC): producción READY del SHA
`d2daa00`, migración de historial aplicada en ambos entornos, `zone-history.sql`
e `invariants.sql` satisfactorios en remoto con rollback y redirección
`/acceso` → `/login` verificada tras actualizar la PWA. El estado siguiente
conserva la evidencia histórica. Los recorridos OAuth/Storage completos siguen
en [[Preparar lanzamiento en Product Hunt]], no se dan por comprobados aquí.

Los cambios previos de cierre documental de MVP, PWA y CI/CD se conservan.
Daniel aprobó la versión 0.3.0 el 2026-09-22. La Preview del commit `875649b`
está READY; la migración y producción siguen pendientes. Evidencia y límites
en [[Lanzamiento en Product Hunt]].

## Evidencia local · 2026-09-19

- 20 tests Angular y 6 tests de configuración/SemVer correctos.
- 5 escenarios Playwright con backend simulado para controlar guardado retenido,
  error de servidor, movimiento → creación → deshacer, propiedades, eliminación,
  rehacer, fallo al deshacer sin perder pila, Shift, toggle,
  cierre exterior/Escape/foco y enlaces antiguos.
- AXE sin incidencias en editor de escritorio e inventario con panel móvil.
- Capturas inspeccionadas: escritorio y móvil 390 px, sin desbordamiento horizontal.
- Build de producción optimizada y escenario PWA (instalación, offline,
  actualización voluntaria) correctos después del cambio de rutas.
- Formato correcto en los archivos de código modificados y `git diff --check`
  correcto. La revisión global también detectó avisos preexistentes en cinco
  scripts y `playwright.pwa.config.ts`; se conservaron esos archivos sin cambios.
- SQL real en `outify_dev` dentro de transacción con rollback: restaura todas las
  propiedades e IDs, recupera ubicación, conserva prenda al borrar zona,
  rechaza snapshot obsoleto, rechaza conflictos de ubicación sin cambio parcial
  y bloquea acceso de otro propietario. No quedan usuarios temporales.

No se ha aplicado permanentemente la migración
`20260919075341_outify_zone_history.sql` a ninguno de los entornos. El frontend
depende de ella para borrar/restaurar zonas mediante historial. Los E2E nuevos
prueban interacción con respuestas controladas; el SQL prueba el backend real.
No se presenta esto como una prueba OAuth/inventario completa con usuario real.

No se ha medido en un móvil físico. El historial dura durante la sesión de la
vista y se vacía al cambiar de armario; no garantiza recuperación tras recargar.
Los tests nuevos se incorporan a CI mediante `test:editor`.

Servidor de verificación: puerto 4201; el proceso anterior del puerto 4200 se
conservó. El shim global de pnpm estaba roto: se utilizó `corepack pnpm` conforme
a las reglas. Las tres notas de cierre que ya tenían cambios al empezar se
han conservado intactas.
