---
Nombre: Aislamiento de Outify en Supabase compartido
Número: 4
Estado: Aceptada
Resumen: Outify usará esquemas y recursos con namespace propio dentro del proyecto compartido devappsdpm-db, con una superficie Data API separada y migraciones coordinadas.
Decisión: Usar los esquemas outify y outify_private y evitar objetos de Outify en public dentro de la base compartida.
Consecuencias: "El aislamiento reduce colisiones y exposición cruzada, pero exige registrar el esquema API, cualificar objetos y coordinar las migraciones globales del proyecto compartido."
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-18T08:43:41+02:00
Última modificación: 2026-09-18T08:43:41+02:00
---

# ADR-0004 · Aislamiento de Outify en Supabase compartido

## Contexto

El backend de Outify se desplegará en el proyecto de Supabase
`devappsdpm-db`. Su base de datos está compartida con otras aplicaciones, por lo
que usar `public` para las tablas y rutinas de Outify produciría colisiones de
nombres, una superficie de API difícil de auditar y riesgo de afectar datos
ajenos durante migraciones.

La configuración de «Exposed schemas» de Supabase controla qué esquemas publica
la Data API. No es un mecanismo de conservación: las actualizaciones de la
plataforma no eliminan por defecto los esquemas personalizados. La persistencia
y reconstrucción segura dependen de que los esquemas estén declarados y
versionados en el repositorio mediante migraciones o esquemas declarativos.

## Decisión

- `outify` será el esquema de la superficie funcional de la aplicación: tablas,
  vistas y rutinas que deban estar disponibles mediante la Data API.
- `outify_private` contendrá funciones auxiliares privilegiadas y objetos
  internos. Nunca se añadirá a la lista de esquemas expuestos.
- Los objetos del modelo aceptado en
  [[Decisiones/ADR-0002 Modelo de datos inicial]] se interpretan como
  `outify.profiles`, `outify.wardrobes`, `outify.zones`, `outify.items`,
  `outify.item_locations`, `outify.tags` y `outify.item_tags`.
- No se crearán objetos propios de Outify en `public`. Las referencias necesarias
  a esquemas gestionados por Supabase, como `auth.users` y `storage.objects`, se
  harán de forma explícita y cualificada.
- El bucket privado de imágenes llevará namespace de aplicación; el nombre
  inicial será `outify-item-images`.
- Todas las consultas SQL, políticas, funciones y migraciones cualificarán el
  esquema; no dependerán de un `search_path` implícito.

## Configuración obligatoria de Supabase

Al configurar el proyecto remoto:

1. Ir a `Project Settings → Data API`.
2. Añadir `outify` a «Exposed schemas» sin retirar los esquemas que necesiten las
   otras aplicaciones del proyecto compartido.
3. No añadir `outify_private`.
4. Conceder a `authenticated` únicamente los privilegios necesarios sobre
   `outify`; `anon` no recibe acceso mientras no exista una función pública que
   lo requiera.
5. Activar RLS en todas las tablas expuestas y mantener las políticas definidas
   en [[Decisiones/ADR-0002 Modelo de datos inicial]].

Cuando se inicialice la configuración local, `supabase/config.toml` reflejará el
esquema `outify` en `[api].schemas`. Los ficheros de `supabase/schemas/` serán la
fuente declarativa y `[db.migrations].schema_paths` incluirá explícitamente, y en
orden, las definiciones de `outify` y `outify_private`.

Añadir `outify` a «Exposed schemas» permite que PostgREST y `supabase-js` lo
consulten; no hacerlo provoca errores de acceso, no el borrado del esquema.

## Acceso desde Angular y generación de tipos

- El cliente usará `supabase.schema('outify')` o configurará `outify` como
  esquema de base de datos.
- Los tipos de TypeScript se generarán incluyendo explícitamente `outify`.
- `outify_private` no aparecerá en el cliente generado ni será accesible desde
  el navegador.
- Ninguna clave privilegiada se incluirá en Angular.

## Migraciones en el proyecto compartido

La tabla `supabase_migrations.schema_migrations` pertenece al proyecto completo,
no a una sola aplicación. Por ello:

- antes de cualquier despliegue se revisará la historia remota y se coordinará
  con las demás aplicaciones que escriban migraciones en `devappsdpm-db`;
- no se ejecutarán reparaciones, resets, diffs globales ni borrados que puedan
  modificar objetos fuera de `outify` y `outify_private`;
- todos los cambios remotos de Outify se realizarán mediante migraciones
  versionadas; no se crearán tablas manualmente en el Dashboard;
- las migraciones no contendrán `drop schema public`, `drop owned` ni operaciones
  destructivas sobre esquemas ajenos;
- antes de aplicar una migración se inspeccionará el SQL generado para confirmar
  que solo afecta a los recursos propiedad de Outify.

El identificador técnico del proyecto (`project ref`) y las credenciales no se
infieren del nombre `devappsdpm-db` ni se guardan en esta ADR; se configurarán de
forma segura cuando se conecte el entorno.

## Alternativas consideradas

- Usar `public` con prefijos en las tablas — descartado porque no separa la
  superficie de API ni las rutinas y políticas de cada aplicación.
- Exponer también `outify_private` — descartado porque ampliaría innecesariamente
  la superficie accesible desde la Data API.
- Crear un proyecto de Supabase exclusivo — no es la infraestructura indicada;
  el requisito actual es convivir en `devappsdpm-db`.

## Consecuencias

- Positivas: límites claros de propiedad, nombres sin colisiones, Data API
  auditable y menor riesgo de afectar a otras aplicaciones.
- Negativas / compromisos: toda consulta debe cualificar el esquema y las
  migraciones requieren coordinación porque la historia es común al proyecto.
- Operación: `outify` debe registrarse tanto en la configuración remota de la
  Data API como en la configuración local y declarativa cuando esta se cree.

## Fuentes

- [Uso de esquemas personalizados](https://supabase.com/docs/guides/api/using-custom-schemas)
- [Seguridad de la Data API](https://supabase.com/docs/guides/api/securing-your-api)
- [Esquemas declarativos](https://supabase.com/docs/guides/local-development/declarative-database-schemas)
- [Migraciones de base de datos](https://supabase.com/docs/guides/deployment/database-migrations)

## Decisiones relacionadas

- [[Decisiones/ADR-0001 Supabase como plataforma backend]]
- [[Decisiones/ADR-0002 Modelo de datos inicial]]

## Tareas relacionadas

- [[Tareas/Completar plantillas de la bóveda de memoria]]
