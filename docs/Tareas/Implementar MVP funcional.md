---
Nombre: Implementar MVP funcional
Estado: Hecha
Resumen: MVP desplegado en Vercel y acceso Google en producción confirmado por el usuario; inventario privado y editor SVG verificados con 11 pruebas unitarias, 2 E2E, SQL y AXE.
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
Trabajo inicial en `feat/functional-mvp`. El usuario realizó el primer despliegue
Vercel según [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel]].


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
- El usuario autorizó el primer push el 2026-09-18 y realizó el primer despliegue
  en Vercel: `https://outify.vercel.app`. Sigue pendiente automatizar CI/CD.
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

El usuario solicitó publicar el MVP para conectarlo a Vercel. Se comprobó que
`origin` apuntaba a `danielperezmartinez/outify` y no tenía ramas remotas. Se publicó
el commit inicial `d2b593e` en `main`, aplicando la excepción de arranque de ADR-0008.
El snapshot incluye código, tests, migraciones, lockfile y documentación; excluye
credenciales temporales, configuración generada, resultados de pruebas y estado
local de Obsidian. Build y pruebas ya verificados en esta implementación.

## Seguimiento del login en producción · 2026-09-18

El usuario informa de un retorno OAuth a `localhost:3000`. Se comprueba que
`Session.login()` envía `${location.origin}/auth/callback` y que
`https://outify.vercel.app/auth/callback` sirve la aplicación con HTTP 200.
El panel de Supabase confirmó que faltaba el callback de Outify en Redirect URLs
y que Site URL tenía el valor por defecto `http://localhost:3000`. El usuario
añadió la URL de retorno y confirmó que el acceso en producción funciona
correctamente. Incidencia resuelta y verificada por el usuario; no requirió cambios
de código ni un nuevo despliegue. Se documenta el callback exacto en el README raíz.

## Cierre de sesión · 2026-09-18

MVP publicado en GitHub, desplegado en `https://outify.vercel.app` y login de
producción confirmado. Sin bloqueos activos para esta entrega. Las tareas de
CI/CD, identidad pública y privacidad conservan sus estados pendientes; no forman
parte de la corrección de redirección. La actualización documental de este cierre
queda en la rama local `fix/production-auth-redirect`, pendiente de commit e
integración mediante PR.
