---
Nombre: Entornos lógicos en un único proyecto Supabase
Número: 9
Estado: Aceptada
Resumen: Desarrollo, previews y producción compartirán devappsdpm-db por restricción de coste, pero separarán datos, API y archivos mediante esquemas y buckets con namespace propio.
Decisión: Usar outify para producción y outify_dev para desarrollo y previews dentro del mismo proyecto Supabase, con sus respectivos esquemas privados y buckets.
Consecuencias: "Se evita pagar otro proyecto y se separan los datos funcionales, pero Auth, cuotas, historial de migraciones y disponibilidad siguen siendo compartidos y no existe aislamiento físico."
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-18T14:27:30+02:00
Última modificación: 2026-09-18T14:27:30+02:00
---

# ADR-0009 · Entornos lógicos en un único proyecto Supabase

## Contexto

Crear otro proyecto Supabase exigiría una suscripción que no resulta rentable
en la etapa actual. Al mismo tiempo, apuntar desarrollo, previews y producción a
las mismas tablas y archivos mezclaría datos de prueba con datos reales.

El proyecto `devappsdpm-db` ya se comparte con otras aplicaciones y
[[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido]] prohíbe
crear objetos de Outify en `public`.

## Decisión

- Se mantiene un único proyecto remoto: `devappsdpm-db`.
- El entorno estable o de producción usa `outify` para la Data API y
  `outify_private` para objetos internos.
- Desarrollo local y los despliegues Preview de Vercel usan `outify_dev` y
  `outify_dev_private`.
- `outify` y `outify_dev` se añaden a «Exposed schemas»; los dos esquemas
  privados permanecen sin exponer.
- Los archivos usan buckets privados separados:
  `outify-item-images` y `outify-dev-item-images`.
- Vercel Production selecciona el esquema y bucket estables. Development y
  Preview seleccionan los recursos de desarrollo mediante variables de entorno.
- Ambos entornos aplican el mismo modelo, restricciones, RLS y contratos. Las
  migraciones deben actualizar los dos esquemas de forma coordinada y evitar
  divergencias manuales.
- Supabase Auth y su conjunto de usuarios permanecen compartidos. Las tablas de
  perfil y todos los datos funcionales sí están separados por esquema.
- El URL y la clave pública del proyecto pueden coincidir entre entornos; nunca
  se expone una clave `service_role` en Angular.

## Salvaguardas

- Los tests automatizados y datos de prueba solo escriben en `outify_dev` y en
  el bucket de desarrollo.
- Las migraciones se revisan para confirmar que no afectan a otros esquemas del
  proyecto compartido.
- Las operaciones destructivas exigen el esquema cualificado explícitamente.
- Si el producto alcanza un volumen o criticidad que justifique el coste, se
  reconsiderará un proyecto Supabase independiente para producción mediante una
  nueva ADR.

## Alternativas consideradas

- Segundo proyecto Supabase — técnicamente preferible por aislamiento completo,
  pero descartado en esta etapa por coste.
- Una sola copia de tablas para todos los entornos — descartada porque mezcla
  datos de prueba y reales.
- Añadir una columna `environment` a todas las tablas — descartado porque
  complicaría RLS y permitiría errores de selección en cada consulta.

## Consecuencias

- Positivas: separación lógica de datos y archivos sin coste adicional y con el
  mismo modelo de acceso desde Angular.
- Negativas / compromisos: Auth, límites de uso, disponibilidad, configuración y
  migraciones continúan teniendo un único punto de fallo y coordinación.

## Decisiones relacionadas

- [[Decisiones/ADR-0001 Supabase como plataforma backend]]
- [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido]]
- [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel]]

## Tareas relacionadas

- [[Tareas/Automatizar CI-CD y previews en Vercel]]
