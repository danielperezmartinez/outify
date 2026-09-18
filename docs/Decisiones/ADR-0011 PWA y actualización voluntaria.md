---
Nombre: PWA y actualización voluntaria
Número: 11
Estado: Aceptada
Resumen: Usar el service worker oficial de Angular para instalar Outify y actualizar mediante un aviso voluntario, cacheando únicamente archivos estáticos de la aplicación.
Decisión: Cachear el shell y bundles, mostrar versiones desde package.json y recargar solo a petición del usuario.
Consecuencias: El inventario requiere conexión; no hay caché offline de datos privados ni sincronización de escrituras.
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-18
Última modificación: 2026-09-18
---

# ADR-0011 · PWA y actualización voluntaria

## Contexto

Outify ya se publica en HTTPS. Se solicita instalación como aplicación, una
versión discreta y aviso de nuevas publicaciones sin interrumpir el trabajo.

## Decisión

- Service worker oficial de Angular, habilitado en builds optimizadas y
  registrado cuando la aplicación se estabilice, con límite de 30 segundos.
- Precarga de archivos estáticos propios, incluidos chunks diferidos. No
  cachear API, Auth, imágenes privadas ni URLs externas.
- Manifest standalone e iconos PNG derivados del favicon provisional existente,
  incluidos maskable y Apple. La identidad definitiva conserva su tarea propia.
- La versión se genera desde `package.json` para la interfaz y `appData` de
  `ngsw.json`. El número del pie también permite comprobar actualizaciones.
- Comprobación inicial del worker, cada 15 minutos con la página visible y al
  volver a ella. «Más tarde» aplaza el aviso hasta otra versión o consulta manual.
- Mostrar el aviso cuando el worker termina de descargar una versión. Actualizar
  recarga la página conservando las protecciones de cambios sin guardar. Nunca
  activar bundles nuevos en caliente ni recargar automáticamente.
- Los fallos de instalación se comunican; los fallos de comprobación periódica
  permanecen silenciosos. Un worker irrecuperable ofrece una recarga explícita.

## Alternativas consideradas

- Worker artesanal: descartado para no duplicar el ciclo de versiones de Angular.
- Sincronización offline de inventario: fuera del alcance solicitado.
- Recarga automática: descartada para evitar interrumpir una edición.

## Consecuencias

La aplicación puede abrirse offline tras la primera visita, pero consultar y
modificar datos requiere conexión. Una pestaña con una publicación anterior a la
introducción de la PWA necesitará una recarga manual inicial para obtenerla.

## Tareas relacionadas

- [[Tareas/Añadir PWA y actualización de versiones]]
- [[Tareas/Definir identidad pública de Outify]]

## Referencia

[Comunicación con el worker de Angular](https://angular.dev/ecosystem/service-workers/communications).
