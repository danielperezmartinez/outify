---
Nombre: Implementar MVP funcional
Estado: Hecha
Resumen: MVP implementado y verificado con Google real, Supabase aislado, inventario privado y editor SVG; 11 pruebas unitarias, 2 E2E, SQL transaccional y AXE correctos.
Decisiones: "[[Producto]]; [[Decisiones visuales]]; [[Decisiones]]"
Bloqueada: []
Fecha de creación: 2026-09-18
Última modificación: 2026-09-18
---

# Implementar MVP funcional

## Alcance y comprobación

- [x] Esquemas de desarrollo y producción, RLS, Storage privado y operaciones transaccionales.
- [x] Sesión Google y plantilla inicial idempotente.
- [x] Armarios y editor SVG con geometría, zoom, gestos, teclado y autoguardado.
- [x] Inventario, filtros, fotos, ubicación, archivado, restauración y borrado.
- [x] Cuenta, estados vacíos, carga, errores y diseño adaptable según [[Decisiones visuales]].
- [x] Pruebas de dominio, integración, aislamiento, build y revisión de accesibilidad.
- [x] Catálogo técnico y documentación de arranque actualizados.

## Seguimiento

Se parte del scaffold Angular, sin commits ni recursos Outify en Supabase.
Trabajo en `feat/functional-mvp`. El primer despliegue Vercel continúa reservado
al usuario según [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel]].


## Resultado verificado · 2026-09-18

- Instalación `--frozen-lockfile`, build de producción y 11 pruebas Vitest correctos.
- Dos pruebas Playwright con Chrome: ciclo completo del inventario y acceso sin
  sesión. Incluyen fotos privadas, sustitución sin dejar la anterior, persistencia
  tras recarga, filtros, asignación con selectores y arrastre, edición con teclado
  y ratón, redimensionado, zoom, undo/redo, archivado, restauración y eliminación.
- AXE sin incidencias en acceso, armarios vacíos y con prendas, editor, inventario,
  formulario y cuenta; también comprobado a 390 px sin desbordamiento horizontal.
- `supabase/tests/invariants.sql` verifica inicialización idempotente, aislamiento
  entre propietarios, etiquetas sin duplicados, archivado, cascadas y limpieza de
  imágenes; todos sus datos se deshacen con rollback.
- El usuario confirmó haber iniciado sesión con Google y abrió `/armarios`.
- Se eliminó la cuenta temporal E2E y se verificó que no quedan imágenes de prueba.
  No se editaron ni borraron los datos del usuario.
- Cinco migraciones aplicadas a ambos entornos. Los nombres de archivo locales
  se alinearon con las versiones asignadas por el historial remoto compartido.
- Tipos generados con Supabase CLI para los dos esquemas públicos de Outify.
- Catálogo técnico estrenado y [[Completar plantillas de la bóveda de memoria]]
  completada. La guía de operación está en el README raíz.

## Operación y límites conocidos

- Servidor local activo en `http://127.0.0.1:4200`; trabaja con `outify_dev`.
- El usuario autorizó el primer push el 2026-09-18. El primer despliegue sigue
  reservado al usuario por ADR-0007. No se ha publicado
  en Vercel ni se ha automatizado CI/CD; están preparados los ajustes de build.
- Continúan separadas las tareas de privacidad/condiciones, identidad final y
  eliminación integral de cuenta. No son parte del MVP aprobado en [[Producto]].
- El zoom táctil se implementó mediante Pointer Events; no se ha medido todavía
  el rendimiento en un dispositivo móvil físico.
- La limpieza de imágenes usa una cola reintentable al cargar inventario; no es
  una transacción distribuida con Storage. Las subidas interrumpidas se reservan
  una hora. Los objetos referenciados no se eliminan por un error de respuesta.
- El proyecto compartido tenía desactivada la comprobación de contraseñas filtradas;
  no se cambió su configuración global. Outify ofrece acceso con Google.

## Entrega inicial a GitHub

El usuario solicita publicar el MVP para conectarlo a Vercel. Se comprueba que
`origin` apunta a `danielperezmartinez/outify` y no tiene ramas remotas. Se prepara
un commit inicial en `main`, aplicando la excepción de arranque de ADR-0008.
El snapshot incluye código, tests, migraciones, lockfile y documentación; excluye
credenciales temporales, configuración generada, resultados de pruebas y estado
local de Obsidian. Build y pruebas ya verificados en esta implementación.
