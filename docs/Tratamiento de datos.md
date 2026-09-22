---
Última modificación: 2026-09-22
---

# Tratamiento de datos

Inventario técnico verificado contra `Session`, `Backend`, `ItemStore`, las
definiciones SQL, el manifest y la configuración del service worker. Complementa
[[Privacidad y condiciones - borrador]] y
[[Tareas/Preparar privacidad condiciones y tratamiento de datos]].

## Flujos y conservación observados

| Tratamiento          | Datos y finalidad                                            | Ubicación / proveedor                                     | Conservación observada                                                                  |
| -------------------- | ------------------------------------------------------------ | --------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Identidad            | ID Google/Supabase, correo, nombre y avatar para acceso      | Google, Supabase Auth y perfiles Outify                   | Baja por espacio preparada; Auth compartido conservado                                  |
| Sesión               | Tokens de sesión y verificador PKCE                          | localStorage, clave por entorno `outify-<schema>-session` | Hasta cierre local, revocación o expiración; cerrar localmente no cierra otras sesiones |
| Inventario           | Fichas, etiquetas, temporadas, armarios, zonas y ubicaciones | PostgreSQL, esquemas por entorno, RLS por propietario     | Hasta eliminación; archivar conserva datos                                              |
| Fotografías          | JPG/PNG/WebP originales, máximo 8 MB                         | Bucket privado Supabase por entorno                       | Borrado/sustitución con cola; reintento al abrir inventario                             |
| Enlaces de imagen    | URL temporal para visualizar fotografías                     | Supabase Storage y memoria de la aplicación               | Firma de 1 hora; renovación cada 45 minutos                                             |
| Cargas interrumpidas | Ruta de imagen pendiente                                     | `image_cleanup`, Storage                                  | Reserva de 1 hora antes de intentar limpieza; sin cron independiente                    |
| Avatar               | URL de imagen recibida del proveedor                         | Navegador solicita imagen a Google                        | Referrer suprimido; Google sigue recibiendo la solicitud                                |
| Tipografía           | WOFF2 estáticos autoalojados                                 | Outify / Vercel                                          | Caché de recursos PWA; sin solicitudes a Google Fonts en la versión local                |
| Interfaz PWA         | HTML, CSS, JS, favicon, manifest e iconos                    | CacheStorage/service worker                               | Según ciclo de actualización; sin `dataGroups` para inventario                          |
| Infraestructura      | IP y otros metadatos de solicitudes y errores potenciales    | Vercel, Supabase y Google                                 | Planes, logs, backups y subencargados por verificar                                     |

No hay SDK de analítica, publicidad, pagos ni IA en el código revisado. Esto no
equivale a ausencia de logs de infraestructura ni a una auditoría de todas las
opciones de los paneles remotos. Los originales se suben sin quitar EXIF: las
fotos pueden contener ubicación u otros metadatos aportados por el archivo.

Región principal de Supabase verificada por MCP: `eu-central-1`. Los límites
lógicos de `outify` / `outify_dev` están en [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase]].

## Dependencias de cuentas verificadas · 2026-09-21

Inspección remota de solo lectura en `devappsdpm-db`: `pg_constraint` y sus
cadenas de `ON DELETE CASCADE`, triggers no internos, definiciones de
`initialize_user_workspace`, privilegios y políticas de perfiles/Storage.
Se consultaron metadatos, no fichas ni contenido privado de usuarios. Esta
revisión no ejecutó borrados ni modificó objetos del proyecto compartido.

| Operación                         | Alcance observado                                                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Borrar un usuario de `auth.users` | Cascada a `nocendland.user`, `outify.profiles`, `outify_dev.profiles` y recursos Auth de esa identidad, incluidas sesiones                                      |
| Cascada desde `nocendland.user`   | Alcanza tablas de finanzas (`finance_*`), objetivos de nutrición y entrenamiento (`training_*`), incluidos planes, ejercicios, registros y comparticiones       |
| Cascada desde un perfil Outify    | Armarios, zonas, artículos, ubicaciones, etiquetas, asociaciones y `image_cleanup` del mismo esquema                                                            |
| Borrar solo `outify.profiles`     | No se observaron claves foráneas ni triggers de borrado que propaguen esa operación a Auth, `nocendland` o `outify_dev`; los archivos requieren limpieza aparte |
| Cerrar sesión actualmente         | `Session.signOut()` utiliza `scope: 'local'`; no es una eliminación de cuenta ni una revocación de todas sus sesiones                                           |

La FK del hijo hacia `auth.users` no funciona en sentido inverso: eliminar el
perfil de Outify no elimina su identidad central. Por tanto, la baja de Outify
puede aislarse sin contratar otra base de datos ni cambiar las FK de otras apps.

El trigger diferido de planes activos de `nocendland` se revisó también: su
función permite la cascada cuando el usuario ya no existe. No constituye una
protección contra ese borrado. Una eliminación central que llegue a completarse
sí puede borrar los datos de las otras apps; no es solo una posibilidad teórica
derivada de compartir infraestructura. El efecto concreto depende de las filas
del usuario y puede ser impedido por otras validaciones, por ejemplo objetos
Storage a su nombre. No se ha ensayado contra cuentas reales.

La documentación de Supabase confirma que borrar una identidad no invalida
inmediatamente sus JWT y que Storage puede impedir ese borrado si posee objetos.
[Gestión de usuarios](https://supabase.com/docs/guides/auth/managing-user-data).
El cierre `local` solo afecta a la sesión actual; `global` afecta a todas las
sesiones de esa identidad compartida. Ninguno debe tratarse como un borrado de
datos ni como una revocación inmediata de todos los tokens de acceso.
[Cierre de sesión](https://supabase.com/docs/guides/auth/signout).

### Hallazgos de la versión publicada, cubiertos por el cambio local

- Ambos entornos permiten a `authenticated` insertar su propio perfil, aunque
  no borrarlo. `initialize_user_workspace()` vuelve a crear perfil, armario y
  zonas si faltan, y `Shell` la llama al entrar. Borrar el perfil desde servidor
  y cerrar solo la pestaña actual permitiría que otra sesión recreara el espacio.
- Las políticas de imágenes de Outify comprueban bucket y prefijo `auth.uid()`;
  no comprueban que el perfil siga activo. Un token vigente podría subir fotos
  incluso después de borrar ese perfil. Hay que comprobar todas las políticas
  aplicables, incluidas las permisivas ajenas que pudieran ampliar el acceso.
- La cascada elimina también `image_cleanup`. Borrar primero el perfil puede
  perder trabajos de limpieza sin eliminar sus archivos. La baja necesita un
  registro de trabajo independiente del perfil y reintentos desde servidor.
- Una solicitud de supresión de todos los datos de Outify debe revisar también
  el entorno de desarrollo si el titular lo usó. No confundir una baja limitada
  al espacio mostrado con la eliminación de todos los datos de esa persona.

## Baja implementada localmente · pendiente de publicación

La acción de la app es **«Eliminar mis datos de
Outify»**. Su alcance se mostrará antes de confirmar y no ejecutará
`auth.admin.deleteUser`. La eventual baja de la identidad compartida se tramitará
por separado, coordinando todas las aplicaciones y recursos asociados.

1. El usuario autenticado solicita eliminar su espacio de Outify y confirma una
   acción explícita que identifica todos los datos afectados, incluyendo el
   entorno o entornos solicitados. La identidad se obtiene de una sesión validada
   en servidor, nunca de un ID de usuario enviado sin comprobar por el cliente.
2. Un proceso de servidor valida su sesión, registra una solicitud idempotente y
   bloquea acceso y nuevas escrituras para ese espacio mientras se elimina.
   El trabajo debe sobrevivir al borrado del perfil. Su estado no será editable
   por el usuario y solo contendrá datos mínimos con retención definida.
3. Se borran mediante Storage API los objetos del prefijo de ese propietario en
   el bucket del entorno correcto, incluidos huérfanos y subidas pendientes. La
   lista debe ser paginada y reintentable; no basta con borrar filas de Storage.
4. Se verifica que no quedan objetos, y se eliminan perfil, armarios, zonas,
   artículos, etiquetas, ubicaciones y trabajos de limpieza de ese entorno.
5. Se limpian las credenciales locales y la memoria de inventario. La baja
   mantiene la identidad central que necesiten las otras aplicaciones y no
   ejecuta revocaciones globales, cambios de metadatos compartidos ni borrados de
   sus archivos. Si la identidad queda sin uso, se remite a un procedimiento
   central con inventario completo, base y plazo de conservación definidos;
   comprobar solo si existen perfiles de las apps conocidas no basta para
   autorizar su borrado ni para conservarla indefinidamente.
6. Se notifica el resultado y se registra la evidencia mínima necesaria, con
   plazo de conservación definido. Logs y backups requieren un plazo distinto;
   una restauración de backup debe volver a aplicar las bajas registradas.

El estado de baja debe comprobarse en RLS de tablas, políticas del bucket y
funciones, incluida la inicialización y los INSERT directos de perfil. Debe
proteger también frente a otras pestañas y peticiones concurrentes, no solo
deshabilitar botones. La limpieza necesita esperar o neutralizar cargas en
vuelo y volver a comprobar el bucket antes de finalizar.

Un acceso posterior a un espacio eliminado debe mostrar su estado y ofrecer
crear un espacio nuevo mediante una acción explícita y validada. No recrearlo
automáticamente al recibir un token antiguo. Tampoco reutilizar rutas de archivos
borrados al volver a registrarse: pueden existir enlaces firmados anteriores.

La prueba final debe contemplar cachés de imágenes y enlaces ya emitidos: no
prometer revocación instantánea de todas las copias. El mecanismo de baja, sus
plazos reales y el tratamiento de la identidad común deben explicarse al usuario
sin exponer datos sobre su actividad en otras aplicaciones.

## Criterios de verificación antes del lanzamiento

- Ensayo con cuenta desechable: datos en ambos entornos y en otro servicio,
  imágenes, huérfanos y error simulado de Storage. Solo desaparece el alcance
  pedido, los fallos se reintentan y no se anuncia una baja incompleta como éxito.
- Nueva conexión y token anterior: sin acceso a información eliminada; sin
  recreación involuntaria durante ni después de la baja. Probar llamadas directas
  a INSERT de perfil y Storage, además del recorrido normal de la interfaz.
- Fallos parciales, dos solicitudes simultáneas y cargas ya en vuelo: trabajo
  persistente, aislamiento entre titulares/entornos y reintento sin duplicaciones.
- Identidad común: baja Outify conserva acceso y datos ajenos; ausencia de otros
  perfiles no dispara automáticamente un borrado central. La eventual supresión
  central se valida mediante su procedimiento coordinado.
- Política de retención de backups, registros técnicos y solicitudes de soporte
  definida con valores reales del plan. No inventar «30 días» por comodidad.
- Exportación o canal operativo para entregar datos al titular, con verificación
  proporcionada de identidad y registro de respuesta.
- Decidir autoalojar las fuentes o documentar su carga remota.
- Enlaces públicos `/privacy` y `/terms` en acceso, cuenta y pie; primera capa de
  información antes de OAuth. Registrar versión/fecha de aceptación de condiciones
  cuando se decida ese flujo. No mezclar publicidad o consentimientos opcionales.

## Operación y publicación

La implementación está en [[Catálogo técnico/Baja y admisión de cuentas]].
`POST /api/account-deletion` valida la identidad en Auth y registra la solicitud.
No acepta un propietario, esquema o bucket proporcionado por el formulario.
Las fotografías se eliminan mediante Storage API en lotes de 100, obtenidos de
los metadatos por bucket y prefijo, incluyendo rutas anidadas y huérfanos.

La cola privada tiene concesiones de 5 minutos para evitar procesamiento
simultáneo. Los fallos liberan el trabajo con reintento diferido 15 minutos;
si se interrumpe el proceso, otro worker puede retomarlo al caducar la concesión.
El cron preparado en Vercel revisa ambas colas una vez al día a las 03:00 UTC
(la precisión depende del plan). Las atiende en paralelo: un fallo o una espera
en un entorno no impide atender el otro. También se intenta limpiar al solicitar la baja.
Un límite de tiempo evita agotar la ejecución; inventarios grandes o fallos
repetidos pueden necesitar varias ejecuciones. No se establece un SLA garantizado.

La finalización exige bucket vacío y que transcurran 2 horas y 5 minutos desde la
solicitud, con un último barrido. Se reserva este margen para cargas previas:
las [URLs de subida firmadas duran 2 horas](https://supabase.com/docs/reference/javascript/file-buckets-createsigneduploadurl).
La prueba local confirmó que usan permisos internos de Storage; el trigger
de Outify bloquea INSERT/UPDATE en espacios cerrados incluso con esos permisos.
Las operaciones DELETE del worker permanecen habilitadas. No se borran filas de
Storage por SQL: se utiliza su [API de eliminación](https://supabase.com/docs/guides/storage/management/delete-objects).

Después del borrado permanece un registro privado mínimo del UUID, estado y
fechas de la baja, sin inventario ni fotografías. Protege contra reaperturas
involuntarias y tokens antiguos. La reapertura requiere una sesión creada
después del cierre y una acción explícita; las sesiones anteriores tampoco
pueden acceder al espacio nuevo. Falta validar la retención y el proceso central
de limpieza de registros que queden sin identidad, sin prometer su eliminación
automática. Las ventanas de logs y disponibilidad de backups comprobadas se
detallan en «Infraestructura comprobada».

Se han preparado `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`,
`OUTIFY_SUPABASE_SECRET_KEY` y `CRON_SECRET` en servidor. Las dos últimas son
secretas; no pasan por la configuración pública Angular. El cron solo corre en
Production y comprueba su secreto. Local/Preview usan `outify_dev`; el endpoint
del usuario nunca elige otro entorno. El cron de Production mantiene ambas colas.
Configurar avisos operativos ante errores y antigüedad excesiva de trabajos antes
de anunciar un plazo público; no se ha verificado aún esa configuración remota.

Aplicar `20260921104610_outify_account_lifecycle.sql` de forma coordinada con el
código y la versión acordada. La migración exige declaración de edad a los
perfiles existentes, por lo que no debe activarse contra una interfaz antigua
que no pueda mostrarla. Comprobar también la migración pendiente del historial,
el despliegue Git/Vercel, los secretos y una baja de una cuenta desechable remota.
No se ha aplicado ningún cambio en la base compartida durante esta implementación.

## Estado

Inventario terminado y dependencias de baja verificadas mediante metadatos
remotos. Borradores actualizados con Daniel Pérez Martínez, España,
dlperezmartinez@gmail.com, gratuidad inicial y registro desde 14 años. La declaración
de edad, la baja y sus pruebas locales están implementadas. Siguen pendientes
plazos/contratos, publicación y pruebas remotas de la baja y validación legal.
Los enlaces públicos están preparados localmente. No se han aceptado contratos ni cambiado configuraciones
compartidas; las pruebas solo usan cuentas desechables del Supabase local aislado.

## Preparación y operación · 2026-09-22

Daniel revisó los documentos y delega su desarrollo y mantenimiento. Las páginas
y enlaces se describen en [[Catálogo técnico/Páginas públicas y enlaces legales]].
Esta nota es interna y no se entrega como adjunto a Product Hunt.

Las fuentes aprobadas se autoalojan en `public/fonts`, con licencias SIL OFL y
orígenes. `scripts/vendor-fonts.mjs` permite regenerarlas. La prueba de navegador
confirma cero peticiones a Google Fonts. Los originales de usuarios siguen
conservando EXIF; no anunciar eliminación de metadatos.

### Infraestructura comprobada

- Supabase sigue en Frankfurt (`eu-central-1`), comprobado por MCP.
- El panel autenticado confirma organización `devappsdpm` en **Free**. La página
  de backups indica que este plan no incluye copias del proyecto; no muestra
  copias recuperables. La [tabla del plan](https://supabase.com/pricing) no incluye
  backups automáticos ni PITR, y fija las ventanas de consulta de logs API/BD en
  un día y Auth Audit Logs en una hora. Esto no acredita la eliminación de todos
  los registros internos del proveedor. No se ha verificado una copia externa;
  queda pendiente definir recuperación sin copiar datos ajenos del proyecto.
- En Auth, el callback `https://outify.vercel.app/auth/callback` está autorizado.
  El Site URL compartido sigue en `http://localhost:3000`; Outify envía un destino
  explícito. No se modifica esa configuración global. La lista no acredita el
  estado público de Google OAuth ni el funcionamiento con una cuenta externa.
- El panel mostró `Unhealthy` y un aviso general de incidencia, mientras una
  consulta MCP anterior había indicado `ACTIVE_HEALTHY`. Es una observación
  transitoria, sin diagnóstico causal. Revalidar salud antes de migrar.
- API autenticada de Vercel: equipo `devappsdpms-projects`, proyecto `outify`,
  plan **Hobby** activo. No tenía variables de entorno.
- Configurados y verificados `SUPABASE_URL` y `SUPABASE_PUBLISHABLE_KEY` para
  Production/Preview; `OUTIFY_SUPABASE_SECRET_KEY` sensible para ambos;
  `CRON_SECRET` sensible solo para Production. Los transitorios con secretos se
  eliminaron. La clave de servidor tiene alcance del proyecto Supabase compartido:
  solo se usa en los handlers con esquema/bucket fijo; nunca se envía al navegador.
- Funciones y cron **sin desplegar**; las dos migraciones siguen pendientes.
  Configurar variables no activa la baja ni modifica la base compartida.
- El límite visible de logs de runtime de Hobby es una hora según la
  [documentación](https://vercel.com/docs/logs/runtime). No equivale al plazo de
  todos sus registros internos de seguridad, facturación o soporte.

### Cobertura contractual pendiente

El [DPA de Vercel](https://vercel.com/legal/dpa), apartados 1 y 4, delimita su
aplicación a Pro/Enterprise. No hay evidencia suficiente para afirmar que cubre
el tratamiento de la API de baja en Hobby. Opciones: obtener confirmación
contractual del proveedor, autorizar un plan cubierto o revisar alojamiento y
ejecución. No se ha enviado ninguna consulta externa ni autorizado un gasto.

Consulta preparada para Daniel: «Uso Vercel Hobby para una aplicación gratuita
con usuarios en España. Una función valida un JWT de Supabase y tramita la baja
de datos privados. ¿Qué contrato del artículo 28 RGPD cubre este tratamiento en
Hobby, dado el alcance Pro/Enterprise de vuestro DPA? ¿Qué alternativa ofrecéis
sin migrar toda la cuenta?».

El [DPA de Supabase](https://supabase.com/legal/customer-resources/data-processing-addendum)
se incorpora a sus condiciones y contempla garantías de transferencia. El plan
Free y la configuración anterior están comprobados; falta conservar evidencia
de los datos del contratante y condiciones aplicables a su cuenta. Su
[documentación de backups](https://supabase.com/docs/guides/platform/backups)
establece plazos distintos por plan y aclara que las copias de BD no contienen
los archivos de Storage. No prometer recuperación de fotos mediante un dump SQL.

### Procedimiento de derechos y conservación operativa

Responsable operativo: Daniel Pérez Martínez. Canal: dlperezmartinez@gmail.com;
el soporte también implica correspondencia alojada en Gmail. No copiar mensajes
ni datos de titulares a esta bóveda.

1. Registrar recepción, derecho y fecha límite de un mes en un registro privado
   restringido; acusar recibo y pedir solo información necesaria.
2. Verificar mediante sesión o correo de la cuenta. Pedir documento de identidad
   solo ante una duda justificada y con minimización.
3. Concretar alcance: espacio actual, ambos entornos o identidad central. No
   reducir silenciosamente una petición general al entorno que esté abierto.
4. Para acceso/portabilidad, extraer solo filas del titular y sus fotografías,
   en JSON/CSV y archivos mediante canal autenticado o enlace temporal. Nunca
   enviar un dump compartido. Revisar la extracción ante una petición real;
   no se ha ejecutado ninguna exportación de datos personales.
5. Para supresión, usar el flujo aislado y comprobar datos e imágenes. No anunciar
   resultado mientras la cola esté pendiente. Coordinar la identidad central
   separadamente con las otras aplicaciones.
6. Responder en un mes; si procede ampliación por complejidad o número, explicar
   motivos dentro del primero, con un máximo de dos meses adicionales.
7. Eliminar copias de exportación tras la entrega y como máximo a los siete días
   de crearlas. Conservar el mensaje mínimo de cierre seis meses para seguimiento;
   borrar adjuntos de identificación al verificar. Ante obligación o reclamación
   concreta, documentar motivo, acceso restringido y plazo antes de conservar más.

El registro técnico de baja se conserva mientras sea necesario para impedir
reaperturas mediante sesiones antiguas de la identidad compartida. Revisar su
necesidad semestralmente. Si desaparece Auth, completar primero la limpieza del
bucket y el margen de cargas; retirar después el registro sin finalidad. Esta
limpieza no está automatizada y no autoriza a Outify a borrar Auth.

Antes de restaurar acceso desde backups, reaplicar las bajas registradas. Ante
incidentes, registrar alcance, contención y evaluación de riesgo y valorar las
notificaciones que correspondan conforme al RGPD. No incluir tokens, fotos ni
datos de titulares en logs. Falta comprobar las alertas y el seguimiento de colas
en la infraestructura publicada; no anunciar todavía un plazo máximo garantizado.
