# Outify

Inventario privado de prendas y editor visual de armarios con Angular 21,
Signals y Supabase. Reglas y decisiones: [docs/README.md](docs/README.md).

## Arranque

Requisitos: Node 24 y pnpm 12.4.2 (también disponible con `corepack pnpm`).

```sh
corepack pnpm install --frozen-lockfile
corepack pnpm start
```

Abre `http://localhost:4200`. El entorno local usa `outify_dev` y el bucket
privado `outify-dev-item-images`. La clave incluida es publicable: la autorización
se aplica mediante Auth, RLS y permisos de Storage.

Se puede copiar `.env.example` a `.env.local` para personalizar la configuración.
Nunca introducir claves secretas o `service_role` en el frontend.

## Comprobación

```sh
corepack pnpm test --watch=false
corepack pnpm test:config
corepack pnpm build
corepack pnpm test:pwa
corepack pnpm exec prettier --check src scripts e2e playwright.config.ts playwright.pwa.config.ts
```

Las pruebas SQL de `supabase/tests/invariants.sql` crean identidades temporales,
operan solo sobre datos funcionales de desarrollo y deshacen toda la transacción.
Comprueban RLS, inicialización, etiquetas, archivado y cascadas.

La prueba Playwright usa una cuenta de pruebas real (nunca una cuenta personal),
con credenciales en el archivo ignorado `tmp/test-account.json`:
`{"email":"…","password":"…"}`. Con el servidor iniciado:

```sh
corepack pnpm exec playwright test
```

Comprueba creación con foto privada, ubicación, recarga, filtros, edición por
teclado, undo/redo, archivado/restauración/borrado, Storage, AXE y vista móvil.
La cuenta debe tener un espacio inicial limpio. Las credenciales y los resultados
no se versionan. Se debe eliminar la cuenta de pruebas al terminar la validación.

## Supabase

- Proyecto compartido `devappsdpm-db`; ninguna tabla propia en `public`.
- Producción: `outify` / `outify_private` / `outify-item-images`.
- Desarrollo: `outify_dev` / `outify_dev_private` / `outify-dev-item-images`.
- Los esquemas privados no se exponen por Data API.
- Migraciones versionadas en `supabase/migrations`; estado declarativo en
  `supabase/schemas`. No ejecutar resets ni pushes globales sobre el proyecto
  compartido. Revisar la historia remota antes de aplicar nuevas migraciones.
- Generación de tipos:

```sh
corepack pnpm dlx supabase@2.75.0 gen types --project-id zckqbrwdgxohdymiwbfz --schema outify,outify_dev
```

Guardar el resultado TypeScript en `src/app/platform/database.types.ts`.

En Auth debe estar habilitado Google y deben admitirse los callbacks utilizados:
`http://localhost:4200/auth/callback`, `http://127.0.0.1:4200/auth/callback` y la
URL de producción `https://outify.vercel.app/auth/callback`. Se añaden en
**Authentication → URL Configuration → Redirect URLs** de Supabase; configurar
solo el dominio sin `/auth/callback` no autoriza este destino. Si se usa otro
alias de Vercel, debe añadirse también su callback exacto. Conservar las URLs de
otras aplicaciones: Auth se comparte dentro del proyecto Supabase.
El acceso usa PKCE y requiere terminar el flujo en el mismo
navegador y origen donde comenzó.

## Publicaciones en Vercel

La integración Git ya está conectada. El protocolo de versiones, publicación y
supervisión está en [las reglas del proyecto](docs/README.md#3-versionado-y-despliegue).
El estado y las evidencias de CI/CD se mantienen en
[la tarea existente](docs/Tareas/Automatizar%20CI-CD%20y%20previews%20en%20Vercel.md).

`vercel.json` prepara build, rutas SPA y cabeceras de revalidación del worker.
Vercel Production selecciona recursos estables y Preview usa desarrollo, incluso
si existe `OUTIFY_ENV=production`. Fuera de Vercel esa variable permite compilar
contra producción explícitamente.

## PWA y actualizaciones

La aplicación publicada ofrece instalación desde el navegador y apertura del
shell sin conexión después de la primera visita. Las consultas y cambios del
inventario requieren conexión. Los iconos conservan la identidad provisional.

El número discreto del pie permite comprobar actualizaciones. El aviso ofrece
«Actualizar» y «Más tarde»; guarda las ediciones antes de recargar. Las pestañas
abiertas antes de introducir la PWA necesitan una primera recarga manual.

`pnpm test:pwa` utiliza una build previa y un servidor local en el puerto 4300,
sin cuenta ni acceso al inventario. Comprueba el worker, shell offline, avisos,
aplazamiento, recarga voluntaria, AXE en escritorio/móvil y restauración local
de contenido anterior bajo una nueva versión. CI instala Chromium automáticamente;
localmente utiliza Chrome. La suite del inventario sigue separada.

Los textos legales, el dominio y la identidad pública final conservan sus tareas
pendientes en la bóveda. Los enlaces legales se añadirán cuando existan documentos
aprobados, conforme al alcance del MVP.
