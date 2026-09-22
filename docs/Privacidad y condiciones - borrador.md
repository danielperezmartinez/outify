---
Última modificación: 2026-09-22
---

# Privacidad y condiciones · borrador para revisión

Documento interno de preparación. Daniel confirmó el 2026-09-22 que lo ha leído
y delega su desarrollo y mantenimiento. La versión pública preparada está en
`src/app/public/legal.ts`, rutas `/privacy` y `/terms`, versión 1 del 2026-09-22.
Está enlazada localmente antes de OAuth, en admisión, cuenta y pie; no se ha
publicado. Esta nota conserva el borrador de trabajo y sus fundamentos.

Pendientes: identificación cuando resulte exigible, retención de infraestructura
y cobertura contractual. El equipo Vercel está en Hobby y su DPA publicado
delimita su aplicación a Pro/Enterprise; no se considera verificado para el plan
actual. Véanse [[Tratamiento de datos]] y
[[Tareas/Preparar privacidad condiciones y tratamiento de datos]].

La versión pública incorpora criterios de conservación y canal de cambios sin
inventar plazos de backups. Las fuentes ya se autoalojan; las menciones a Google
Fonts de abajo corresponden al borrador histórico. La información sobre bajas
solo debe publicarse junto con su infraestructura funcional.

## Datos confirmados y pendientes

- Responsable: Daniel Pérez Martínez.
- País de establecimiento: España. [COMPLETAR OTROS DATOS EXIGIBLES, SI PROCEDE].
- Contacto público de soporte y privacidad: dlperezmartinez@gmail.com.
- Dirección de contacto, si corresponde: [DIRECCIÓN].
- Registro: personas de 14 años o más, decisión confirmada el 2026-09-21.
- Modelo económico de lanzamiento: gratuito inicialmente, sin compromiso de
  gratuidad perpetua.
- Fechas de vigencia y versión de documentos: [FECHA / VERSIÓN].

## Política de privacidad propuesta

### Quién trata tus datos

El responsable de Outify es Daniel Pérez Martínez, establecido en España, con
contacto en dlperezmartinez@gmail.com y [DIRECCIÓN, SI PROCEDE]. Esta política explica el tratamiento de datos
al acceder a Outify y organizar tu inventario de ropa.

### Qué información utilizamos

Al entrar con Google recibimos tu identificador de cuenta, correo, nombre y
avatar. No recibimos tu contraseña de Google. Conservamos los armarios y zonas
que creas, sus nombres, medidas, posiciones y colores; las fichas de tus
artículos, fotografías, etiquetas, categorías, temporadas y ubicaciones; y las
fechas necesarias para operar el servicio.

Registramos la fecha en que declaras tener al menos 14 años; no solicitamos tu
fecha de nacimiento ni documentos de identidad para el alta ordinaria.

Los proveedores de alojamiento y autenticación pueden registrar información
técnica de las solicitudes, como dirección IP, navegador, fecha y resultado,
para prestar y proteger el servicio. [CONCRETAR REGISTROS Y PLAZOS CONTRATADOS].

Las fotografías se suben como archivos originales: Outify todavía no elimina
sus metadatos. Evita incluir documentos, información privada innecesaria o
imágenes de otras personas sin autorización.

### Para qué se utiliza

Usamos la identidad para darte acceso a tu espacio; tus fichas, imágenes y
ubicaciones para ofrecer el inventario visual; y la información técnica para
mantener y proteger la aplicación y atender incidencias. El código revisado no
incluye publicidad, venta de datos, analítica de comportamiento ni funciones de IA.

Propuesta sujeta a validación: ejecución del servicio para cuenta e inventario;
interés legítimo evaluado para seguridad y atención de incidencias; cumplimiento
de obligaciones legales cuando corresponda. No se utiliza una aceptación general
de la política como consentimiento para todas las operaciones.

### Proveedores y acceso

Supabase presta autenticación, base de datos y almacenamiento de imágenes; Vercel
aloja la aplicación; Google interviene en el acceso y sirve el avatar. En la
versión actual también se solicita tipografía a Google Fonts. Los datos del
inventario no se muestran a otros usuarios. Las fotografías se sirven mediante
enlaces temporales: cualquier persona que reciba uno podría abrirlo mientras
sea válido, por lo que no debes compartirlos si quieres mantener su privacidad.

La región principal de la base de datos de Supabase es Frankfurt (`eu-central-1`),
verificada el 2026-09-19. Esto no significa que todos los tratamientos de todos
los proveedores ocurran exclusivamente en la UE. [COMPLETAR DESTINATARIOS,
TRANSFERENCIAS Y GARANTÍAS TRAS VERIFICAR CONTRATOS Y SUBENCARGADOS].

### Conservación y eliminación

Conservamos tu inventario mientras mantengas el servicio. Archivar una prenda
conserva su ficha y fotografía; eliminar un armario o una zona conserva las prendas
y las deja sin ubicación. El borrado permanente de una prenda elimina su ficha y
encola la limpieza de su imagen. Si la limpieza falla, se reintenta al abrir el
inventario. Una carga interrumpida puede permanecer pendiente al menos una hora.

Desde Mi cuenta puedes solicitar «Eliminar mis datos de Outify» y confirmar el
borrado. El acceso al espacio se cierra al registrarse la solicitud. La limpieza
se realiza desde servidor y se reintenta si algún servicio falla; puedes cerrar
la página. El proceso incluye una comprobación posterior de posibles cargas
pendientes y su estado puede consultarse al volver a entrar.

La acción afecta al espacio indicado en la confirmación. Para pedir la supresión
también de otros entornos de Outify o una copia de tus datos, escribe al correo
de contacto. No se elimina tu cuenta de Google ni la identidad compartida que
necesiten las otras aplicaciones. La conservación o supresión de esa identidad
central requiere tramitar sus dependencias por separado.

Tras la baja conservamos un registro técnico mínimo del identificador y estado
de cierre para impedir la reapertura mediante sesiones antiguas. No contiene
tu inventario ni fotografías. [VALIDAR BASE, RETENCIÓN Y LIMPIEZA DE ESTE REGISTRO
AL DESAPARECER LA IDENTIDAD CENTRAL]. Los plazos de logs y copias de seguridad
siguen pendientes de verificar con los proveedores.

[ANTES DE PUBLICAR: ACTIVAR Y COMPROBAR EL WORKER Y CRON EN PRODUCCIÓN]. La
implementación prepara reintentos diarios y una comprobación final después de
un margen de 2 horas y 5 minutos. No es un compromiso de borrado instantáneo ni
garantiza un plazo máximo ante fallos de infraestructura; los detalles operativos
están en [[Tratamiento de datos]].

### Tus derechos y contacto

Puedes dirigirte a dlperezmartinez@gmail.com para solicitar acceso, rectificación, supresión,
limitación, oposición y, cuando corresponda, portabilidad. Se comprobará tu
identidad de forma proporcionada. Puedes presentar una reclamación ante la
[Agencia Española de Protección de Datos](https://www.aepd.es/derechos-y-deberes/ejerce-tus-derechos),
sin perjuicio de acudir a otra autoridad de control competente.

Recibirás respuesta sin dilación indebida y, como máximo, en un mes desde la
recepción de la solicitud. Si su complejidad o número exige ampliar el plazo,
podrá prorrogarse hasta dos meses más; se te informará de la ampliación y sus
motivos dentro del primer mes. Este plazo de respuesta no sustituye los plazos
de borrado y conservación que debemos concretar. [PREPARAR PROCEDIMIENTO INTERNO].

### Almacenamiento del navegador

Outify conserva la sesión y los datos necesarios para completar el acceso con
Google en el navegador. La PWA guarda recursos de la aplicación para poder abrir
su interfaz; no ofrece un inventario privado completo sin conexión. No se ha
añadido analítica ni publicidad al código revisado. Las cookies de las páginas
de Google durante el acceso pertenecen a ese proveedor.

Los cambios relevantes de esta política se comunicarán en [CANAL], con su fecha
y versión. Si se añaden finalidades que requieran consentimiento, se solicitará
de forma separada antes de activarlas.

## Condiciones de uso propuestas

### El servicio

Outify permite registrar artículos de ropa, calzado y accesorios, dibujar zonas
en tus armarios y consultar dónde has guardado cada artículo. Las ubicaciones
dependen de la información que introduzcas: la aplicación no detecta movimientos
físicos. Esta versión no crea conjuntos ni ofrece recomendaciones de compra.

El servicio lo presta Daniel Pérez Martínez. Para crear una cuenta de Outify
debes tener al menos 14 años. Las personas menores de 14 años no pueden registrarse.
El uso del servicio es gratuito en su lanzamiento. Cualquier cambio económico
se comunicará antes de que resulte aplicable y, cuando corresponda, requerirá
aceptación; el uso actual no autoriza cobros futuros.

### Tu cuenta y uso permitido

El acceso requiere una cuenta de Google. Debes proteger ese acceso y utilizar
Outify de forma lícita. No puedes acceder a espacios ajenos, eludir las medidas
de seguridad ni utilizar la aplicación para distribuir contenido ilícito o
vulnerar derechos de terceros. Comunica las incidencias en dlperezmartinez@gmail.com.

### Tus fotografías y contenidos

Conservas los derechos sobre el contenido que subes. Debes disponer de los
permisos necesarios para utilizarlo. Autorizas únicamente su alojamiento,
reproducción técnica y visualización necesarios para prestar Outify y cumplir
obligaciones aplicables. Esa autorización no permite utilizar tus fotografías en
campañas, entrenar modelos ni publicarlas en galerías del producto.

No subas material que no tengas derecho a tratar ni datos personales innecesarios.
Las capturas de promoción se prepararán con contenido de demostración autorizado.

### Cambios y disponibilidad

Outify puede evolucionar y necesitar mantenimiento. Se comunicarán cambios
relevantes mediante [CANAL]. No se garantiza disponibilidad ininterrumpida. Las
limitaciones de responsabilidad solo operarán dentro de la legislación aplicable
y no excluirán derechos irrenunciables de consumidores ni responsabilidades que
legalmente no puedan limitarse.

### Archivo, borrado y cierre

Archivar conserva los artículos; borrar definitivamente una prenda no permite
recuperarla desde Outify. Borrar una zona conserva sus prendas sin asignar. El
historial del editor permite recuperar operaciones de zona durante la sesión
actual; se pierde al recargar o cambiar de armario y no es una copia de seguridad.

Puedes solicitar la baja en Mi cuenta confirmando la eliminación de tus datos.
Una vez registrada, no se puede cancelar ni deshacer. La limpieza continúa desde
servidor y su estado puede consultarse al entrar. Para obtener una copia o
tramitar una solicitud que abarque otros entornos de Outify, utiliza el correo
de contacto. Eliminar tu espacio de Outify no elimina tu cuenta de Google ni
los datos de otras aplicaciones. Volver a utilizar Outify tras la baja requiere
una nueva sesión y crear expresamente un espacio vacío.

### Contacto y legislación

Soporte: dlperezmartinez@gmail.com. Se aplicará la legislación española, respetando las normas
imperativas y los fueros que correspondan al usuario. No se fija de antemano un
tribunal exclusivo que pueda limitar los derechos de consumidores.

## Fundamento y revisión pendiente

Con responsable establecido en España, revisar transparencia, bases jurídicas, derechos,
encargados y transferencias contra sus artículos 6, 12–22, 28 y 44 y siguientes:
[texto oficial](https://eur-lex.europa.eu/eli/reg/2016/679/oj/eng).
La revisión del 2026-09-21 incorpora responsable, España, correo público, público
general y gratuidad inicial confirmados por Daniel. Posteriormente se acordó
registro desde 14 años. Siguen pendientes los contratos, los plazos de
infraestructura y validar los textos antes de publicarlos.

### Menores: público general y capacidad de acceso

Daniel ha decidido excluir del registro a menores de 14 años. En España,
el artículo 7 de la LOPDGDD regula el
consentimiento para datos de menores: por debajo de 14 años, cuando esa sea la
base jurídica, debe intervenir quien ostente la patria potestad o tutela. No es
una prohibición general de utilizar aplicaciones ni convierte todos los
tratamientos en consentidos.
[LOPDGDD, artículo 7](https://www.boe.es/buscar/act.php?id=BOE-A-2018-16673#a7).

La capacidad para aceptar las condiciones debe revisarse por separado, según el
servicio y la edad; el artículo 1263 del Código Civil contempla determinados
contratos de la vida corriente de los menores.
[Código Civil, artículo 1263](https://www.boe.es/buscar/act.php?id=BOE-A-1889-4763#a1263).

Google fija 14 años en España para gestionar una cuenta propia y ofrece cuentas
supervisadas por debajo de esa edad. El acceso Google actual no acredita por sí
solo la edad ni la autorización necesaria para Outify. No se ofrece un flujo de
registro para menores de 14 con cuentas supervisadas.
[Edad de las cuentas de Google](https://support.google.com/accounts/answer/1350409?hl=es).

La implementación solicita una declaración antes de OAuth y la registra en el
backend antes de permitir crear/abrir el espacio; los usuarios existentes también
deben declararla. Es una declaración del usuario, no una verificación documental
de edad. Antes de abrir acceso internacional, revisar los países de destino; el
umbral español no debe tratarse como una regla mundial.

### Identificación y operación

Que el servicio sea gratuito para el usuario no descarta por sí solo la LSSI:
su ámbito incluye servicios gratuitos que constituyan actividad económica para
el prestador. Si resulta aplicable, revisar la información del artículo 10,
incluidos domicilio y datos identificativos exigibles. No publicar un domicilio
o NIF inventado ni dar por cumplido ese apartado con nombre y correo.
[LSSI, artículo 10 y anexo](https://www.boe.es/buscar/act.php?id=BOE-A-2002-13758).

El plazo de respuesta de derechos se ha contrastado con el artículo 12.3 del
RGPD y los [modelos de reclamación de la AEPD](https://www.boe.es/buscar/doc.php?id=BOE-A-2023-16062).
Falta habilitar su atención efectiva, publicar la baja descrita en
[[Tratamiento de datos]] y verificar contratos, conservación y canal de cambios.

Proveedores consultados el 2026-09-19:
[DPA Supabase](https://supabase.com/legal/customer-resources/data-processing-addendum)
y [DPA Vercel](https://vercel.com/legal/dpa). Leerlos no demuestra su aceptación
contractual ni verifica las opciones del plan contratado.
