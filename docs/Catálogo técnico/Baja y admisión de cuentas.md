---
Nombre: Baja y admisión de cuentas
Tipo: Servicio y API
Área: Plataforma
Feature: account
Estado: En revisión
Ámbito: Aplicación y servidor
Resumen: Declaración de edad desde 14 años, cierre por entorno, worker de Storage con reintentos y reapertura protegida frente a sesiones antiguas; preparado y probado localmente.
Fuente: server/account-deletion.mjs
Entrada pública: WorkspaceAccess; get_workspace_status; activate_workspace; POST /api/account-deletion
Fecha de creación: 2026-09-21
Última modificación: 2026-09-22
---

La política de edad y el ciclo de baja residen en las funciones y tabla privada
de `supabase/migrations/20260921104610_outify_account_lifecycle.sql`, reflejadas
en ambos esquemas declarativos. El estado no se toma de metadatos editables de Auth.

`WorkspaceAccess` coordina estado, registro de edad y vaciado de cachés. El shell
retira el contenido privado al cerrarse el espacio; descarta respuestas de estado
antiguas y los stores descartan respuestas de datos anteriores al cierre.
`DeleteAccount` pide confirmación explícita. `WorkspaceGate` muestra admisión,
baja pendiente, baja completada y necesidad de nueva sesión.

`server/account-deletion.mjs` contiene los handlers y el worker compartido.
Las RPC de adquisición, lotes, finalización y reintento solo admiten `service_role`.
La parte pública solo puede pedir su propia baja; nunca invoca `deleteUser` ni
sign-out global. Operación, conservación y publicación: [[Tratamiento de datos]].

El cron procesa las dos colas en paralelo, con presupuesto de tiempo compartido
y contadores independientes. Un error o una espera en una no impide atender la
otra; cualquier fallo produce HTTP 503 para que sea observable. Nueve pruebas
de servidor cubren también esa independencia. Variables configuradas en Vercel;
funciones, cron y migraciones aún sin publicar.

Verificación: `pnpm test:server`, `pnpm test:editor`, tests de Angular y
`supabase/tests/{invariants,zone-history}.sql`. El test
`pnpm test:account:local` exige un Supabase local aislado llamado `outify-lifecycle`
y su salida `supabase status -o env` en `tmp/local-supabase.env`; rechaza URLs remotas.
Para reproducir la instancia de prueba, copiar config y migraciones bajo
`tmp/lifecycle-supabase/supabase`, cambiar su `project_id` a `outify-lifecycle`
y sustituir **solo en esa copia local** la migración histórica `outify_expose_api`
por el ajuste de esquemas a `outify,outify_dev`. Aquella migración incluye
esquemas de otras apps de la base compartida que no existen en una instalación
vacía. Nunca utilizar reset contra el proyecto remoto.

El test de integración usa Auth y Storage reales locales y crea otra aplicación
simulada con FK a la misma identidad. No prueba la infraestructura Vercel remota.
La entrada pasa a vigente tras publicar y verificar ese recorrido.
