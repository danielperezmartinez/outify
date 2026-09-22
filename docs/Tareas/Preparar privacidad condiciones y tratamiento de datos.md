---
Nombre: Preparar privacidad condiciones y tratamiento de datos
Estado: En curso
Resumen: Definir y publicar los textos y flujos legales necesarios antes de admitir usuarios reales, incluyendo imágenes, OAuth, conservación y eliminación de datos.
Decisiones: '[[Decisiones/ADR-0001 Supabase como plataforma backend|ADR-0001]]; [[Decisiones/ADR-0002 Modelo de datos inicial|ADR-0002]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]; [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase|ADR-0009]]'
Bloqueada: []
Fecha de creación: 2026-09-18T14:27:30+02:00
Última modificación: 2026-09-22
---

# Preparar privacidad, condiciones y tratamiento de datos

## Objetivo

Disponer antes del acceso de usuarios reales de información legal comprensible
y flujos que reflejen fielmente cómo Outify trata cuentas, fotografías y datos
de inventario.

## Alcance

- Determinar responsable, jurisdicción, público objetivo y canales de contacto.
- Redactar política de privacidad y condiciones de uso.
- Inventariar datos tratados por Google OAuth, Supabase, Vercel y la propia
  aplicación.
- Explicar finalidad, base jurídica, conservación, encargados y transferencias
  que resulten aplicables.
- Definir derechos del usuario y flujo de eliminación de cuenta, imágenes y
  datos relacionados.
- Definir reglas sobre propiedad y uso de las fotografías subidas.
- Revisar cookies, almacenamiento local y analítica cuando se decidan.
- Añadir enlaces y aceptación donde proceda en acceso, cuenta y pie de página.
- Someter los textos a revisión profesional adecuada antes del lanzamiento
  público; esta tarea de producto no sustituye asesoramiento jurídico.

## Criterios de finalización

- [x] Inventario de datos y proveedores verificado contra la implementación.
- [ ] Política de privacidad y condiciones aprobadas y publicadas.
- [ ] Flujos de acceso y cuenta enlazan los documentos vigentes.
- [ ] La eliminación de cuenta y datos se ha probado de extremo a extremo.
- [x] Baja implementada y probada con Auth, RLS y Storage reales en Supabase local aislado.
- [x] Registro desde 14 años y declaración persistida en servidor, sin fecha de nacimiento.
- [ ] Conservación y borrado de imágenes coinciden con Storage y base de datos.
- [ ] Revisión jurídica o validación equivalente registrada antes del acceso de
      usuarios reales.

## Fuera de alcance

- Inventar requisitos legales sin conocer jurisdicción y público objetivo.
- Activar analítica o cookies no esenciales antes de definir su tratamiento.

## Inventario observado en la implementación del MVP

- Google proporciona identidad, correo, nombre y avatar; la autorización usa Auth/RLS.
- Supabase conserva fichas, etiquetas, geometría y fotografías privadas; las URLs
  firmadas de imagen duran una hora y se renuevan durante la sesión.
- El navegador conserva la sesión PKCE en almacenamiento local con clave propia
  por entorno. No se ha añadido analítica.
- Las fuentes aprobadas se cargan desde Google Fonts: incluir este proveedor en
  la revisión o autoalojarlas antes del lanzamiento si así se decide.
- Los borrados de artículos y las sustituciones de foto registran una cola de
  limpieza persistente. Se reintenta al abrir el inventario; una subida abortada
  se reserva una hora antes de considerarse huérfana.
- La baja de datos de Outify está implementada localmente con cola persistente;
  falta desplegarla y verificar la infraestructura remota. No se han publicado textos legales provisionales.

## Preparación · 2026-09-19

Inventario ampliado en [[Tratamiento de datos]] y textos revisables en
[[Privacidad y condiciones - borrador]]. Los borradores no se han presentado como
políticas aprobadas ni publicado en la app.

La base de datos principal está en `eu-central-1` (MCP). Siguen por verificar
contratos, subencargados, logs/backups y sus plazos. La baja requiere aislamiento
de Outify: borrar la identidad Auth compartida sin comprobar dependencias puede
afectar a otras aplicaciones. Diseño y criterios de prueba en la nota técnica.

## Datos y verificación · 2026-09-21

Daniel Pérez Martínez confirmó España, dlperezmartinez@gmail.com, público general
y gratuidad inicial. Incorporados al borrador junto con la autoridad de control
y los plazos de respuesta de derechos. Daniel decidió después que el registro
requiere al menos 14 años; esa decisión se incorpora al alta y al backend.

Inspección remota de solo lectura: `auth.users` tiene cascadas a
`nocendland.user`, `outify.profiles` y `outify_dev.profiles`; la cadena alcanza
datos de finanzas, nutrición y entrenamiento en la otra aplicación. Verificados
también los triggers y la inicialización automática del espacio. El diseño de
baja y las limitaciones de la evidencia se amplían en [[Tratamiento de datos]].
No se ha ejecutado ningún borrado ni cambiado la configuración compartida.

## Implementación local · 2026-09-21

La baja bloquea el espacio en RLS y en escrituras, limpia Storage con una cola
persistente y elimina después el perfil y sus dependencias de Outify. No llama
a la eliminación central de Auth ni a cierre global. La reapertura exige sesión
nueva y acción explícita; las sesiones anteriores tampoco acceden al nuevo espacio.

Verificado con Supabase local aislado: creación/edad, FK/RLS, Storage real,
subida previamente firmada, duplicados, concesión exclusiva del trabajo,
conservación de otro entorno y de una aplicación simulada, y reapertura.
Pruebas de navegador cubren confirmación, estado tras recarga, respuesta perdida
y accesibilidad móvil. La limpieza del estado cliente descarta respuestas antiguas.

Operación y requisitos de publicación en [[Tratamiento de datos]] y
[[Catálogo técnico/Baja y admisión de cuentas]]. Pendientes secretos de servidor,
cron remoto, migración coordinada, versión acordada y comprobación de despliegue.
Estos pendientes no impiden revisar el código y los textos preparados.

## Revisión y avance · 2026-09-22

Daniel ha leído los documentos y delega en el agente su desarrollo y mantenimiento.
La revisión del titular queda completada; no se presenta como dictamen jurídico.
Páginas `/privacy` y `/terms` y enlaces de acceso/admisión/cuenta/pie implementados
y verificados con navegador/AXE. Fuentes autoalojadas con licencias. Procedimiento
interno de derechos, exportación, soporte y conservación añadido a [[Tratamiento de datos]].

Variables de servidor configuradas en Vercel y verificadas sin mostrar secretos.
Las funciones, cron y migraciones siguen sin desplegar. La API confirma plan Hobby;
el DPA publicado de Vercel delimita su alcance a Pro/Enterprise. Resolver cobertura
contractual antes de cerrar/publicar los textos. No se ha cambiado de plan ni
enviado una consulta a terceros. Supabase Free y ausencia de backups automáticos
confirmados; ventanas de logs y callback de producción registrados en
[[Tratamiento de datos]]. Siguen pendientes identificación si procede, cobertura
contractual, recuperación y seguimiento operativo, publicación y prueba
remota de la baja.

Versión **0.3.0 minor aprobada por Daniel el 2026-09-22**. La aprobación permite
preparar PR y Preview; no da por resueltos los contratos ni activa las migraciones.
