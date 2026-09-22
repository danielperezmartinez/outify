---
Última modificación: 2026-09-22
---

# Lanzamiento en Product Hunt

## Avance · 2026-09-22

Daniel revisó el dossier y encargó abordar los pendientes. Preparado localmente:

- Portada `/` y presentación inglesa `/en`, con precio, soporte, relato y aviso
  de que la app está en español. La traducción de la app sigue sin decidirse.
- Páginas `/privacy` y `/terms`, accesibles sin sesión y enlazadas antes de OAuth,
  en admisión, cuenta y pie. [[Tratamiento de datos]] es interno; no se adjunta a PH.
- Propuesta de símbolo propio: una O con compartimentos de armario. SVG normal e
  inverso, favicon y PNG PWA/apple-touch-icon en `public/brand` y `public/icons`.
- `public/launch`: miniatura `thumbnail.png` de 240 × 240; `gallery-1.png` a
  `gallery-4.png`, 1270 × 760; `social.png`, 1200 × 630.
- Capturas de la app real local con inventario ficticio y seis ilustraciones
  propias. No se usan datos ni fotos de usuarios. Se identifica como demostración.
  Regeneración: `node scripts/prepare-launch.mjs`, servidor local en 4201.
- Open Graph/Twitter y canónica con el dominio actual como propuesta. Fuentes
  autoalojadas, sin peticiones a Google Fonts.
- Variables de servidor de la baja configuradas y verificadas en Vercel.
  Migraciones, funciones y cron todavía sin publicar.

Verificación: build, 23 pruebas Angular, 9 de servidor, 6 de configuración,
9 de navegador y 1 de PWA, incluyendo AXE y móvil. La prueba de baja con backend real sigue
siendo la del Supabase local aislado, no una comprobación de producción.

### Lista pendiente completa tras este avance

1. **Identificación y contratos:** confirmar si existe actividad económica y los
   datos identificativos exigibles. Vercel está en Hobby, mientras que su DPA
   público delimita el alcance a Pro/Enterprise. Resolver la cobertura contractual.
2. **Conservación y operación:** Supabase Free confirmado, sin backups automáticos
   disponibles; ventanas de logs documentadas en [[Tratamiento de datos]]. Concretar
   recuperación, identidad central con las otras apps y seguimiento de colas.
3. **Publicación de baja, edad y editor:** versión **0.3.0 minor aprobada por Daniel
   el 2026-09-22** y registrada en `package.json`. Preparar PR/Preview, migraciones
   coordinadas, integración y revisión del SHA desplegado. La aprobación de
   versión no resuelve los pendientes contractuales de producción.
4. **Baja remota:** cuenta desechable, cron, reintentos, aislamiento de ambos
   entornos y conservación de identidad y datos ajenos.
5. **Google real:** verificar OAuth público, alta/callback/móvil con cuenta externa
   a las de desarrollo. El callback de producción ya está autorizado en Supabase;
   falta el de Preview y registrar las URLs legales cuando estén publicadas.
6. **Idioma:** confirmar presentación inglesa con app española, o traducir también
   los flujos privados. La primera opción está preparada como propuesta.
7. **Marca y dominio:** revisar símbolo/iconos/galería y confirmar dominio actual
   o propio. No se ha comprado ningún dominio ni aprobado la marca por Daniel.
8. **Recursos finales:** regenerar capturas si cambia la UI y comprobar enlaces y
   vista social en la URL publicada. Fotografías propias pueden sustituir las
   ilustraciones, pero no son obligatorias para una demostración veraz.
9. **Cuenta PH:** perfil personal, acceso para publicar, usuario maker y búsqueda
   de ficha previa. No se ha accedido a una cuenta ni creado una ficha.
10. **Ficha y fecha:** cargar URL, textos, categorías disponibles, Free, miniatura,
    galería y comentario del creador; revisar previsualización y elegir fecha.
11. **Opcional:** vídeo o demo interactiva. No bloquea el lanzamiento.

Los textos de ficha y del creador están preparados más abajo. La guía oficial de
publicación se volvió a consultar el 2026-09-22. La auditoría siguiente conserva
el contexto del estado publicado, que aún no incorpora estos cambios locales.

Paquete de entrega local: `tmp/Outify-Product-Hunt.zip`, con miniatura, cuatro
imágenes, imagen social e instrucciones. Antes de migrar, comprobar de nuevo
salud del proveedor: en la revisión del panel apareció `Unhealthy` y un aviso
general de incidencia; no se ha atribuido su causa a Outify ni modificado el
proyecto compartido para resolverlo.

### Pasos que debe completar Daniel

En orden, con las decisiones separadas del trabajo técnico que sigue a cargo
del agente:

1. **Confirmar el uso del proyecto.** Indicar si es personal y sin ingresos,
   publicidad, afiliación o actividad profesional/económica. Si existe actividad
   económica, concretar los datos identificativos exigibles antes de publicar
   los textos. No añadir domicilio o identificadores privados a la bóveda.
2. **Resolver Vercel Hobby.** Enviar al soporte la consulta preparada en
   [[Tratamiento de datos#Cobertura contractual pendiente]] y trasladar la
   respuesta. Si no hay cobertura, decidir entre un plan cubierto con coste
   autorizado o una alternativa de alojamiento que se evaluará antes de migrar.
3. **Dar el visto bueno visual.** Revisar `tmp/Outify-Product-Hunt.zip` y confirmar
   símbolo, iconos y galería, o indicar cambios concretos. Las prendas son
   ilustraciones propias y el inventario de demostración es ficticio.
4. **Confirmar dominio e idioma.** Elegir el dominio actual `outify.vercel.app`
   o uno propio, y presentación inglesa con app española (preparada) o traducción
   adicional de la app. Comprar un dominio solo si se decide usar uno propio.
5. **Completar la revisión de otras apps.** Compartir los resultados de sus
   agentes sobre bajas centrales. Acordar cómo se atiende una petición que
   abarque la identidad común sin borrar datos ajenos a una baja de Outify.
6. **Comprobar Google con nosotros.** En la consola del proyecto Google correcto,
   confirmar que OAuth permite usuarios externos y registrar las URLs legales
   cuando estén publicadas. Probar acceso desde móvil con una cuenta externa
   de prueba cuando el agente confirme que backend y callback están listos;
   no facilitar contraseñas ni usar una cuenta real para probar borrados.
7. **Preparar la cuenta personal de Product Hunt.** Completar perfil, comprobar
   acceso para publicar y facilitar el usuario maker. Revisar si ya existe una
   ficha del mismo proyecto antes de crear otra.
8. **Elegir la fecha y revisar el borrador.** Una vez verificada producción,
   cargar los textos e imágenes preparados, revisar la previsualización y
   acordar fecha de publicación. El vídeo es opcional.

No corresponde a Daniel ejecutar SQL, configurar secretos, resolver CI ni
hacer el despliegue técnico. Eso sigue a cargo del agente. Antes de integrar
producción quedan migración coordinada, recuperación, observación de colas,
prueba remota de baja y comprobación de enlaces/versión. Los resultados del
despliegue se registrarán en la PR; no se considera completa esta tarea por
generar una Preview.

Revisión del 2026-09-19: web pública `https://outify.vercel.app` en navegador,
código, iconos y metadatos del repositorio y documentación oficial de Product Hunt.
Seguimiento: [[Tareas/Preparar lanzamiento en Product Hunt]].

## Dictamen

La aplicación ya permite demostrar el producto. Recomiendo cerrar primero los
flujos legales y las correcciones del editor, y preparar una presentación visual
que se pueda entender antes de iniciar sesión. La web pública muestra una
ilustración y el acceso Google, pero no enseña capturas reales ni explica con
precisión el inventario y las ubicaciones.

La interfaz está en español. Para una audiencia internacional recomiendo al
menos una presentación pública y galería en inglés; idealmente, también una
versión inglesa de los flujos principales. No es un requisito formal de alta
verificado de Product Hunt, sino una recomendación de producto.

## Qué necesitamos terminar

| Prioridad                | Elemento                                | Situación real y siguiente paso                                                                                                                                                          |
| ------------------------ | --------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Antes de admitir público | Privacidad, condiciones, soporte y baja | Registro desde 14 años y baja implementados localmente; faltan publicación, plazos/contratos y validación de textos en [[Tareas/Preparar privacidad condiciones y tratamiento de datos]] |
| Antes del lanzamiento    | Editor y menús                          | Correcciones locales en [[Tareas/Corregir interacciones del editor y navegación]]; verificar y publicar con versión acordada                                                             |
| Antes del lanzamiento    | Acceso de un usuario nuevo              | Confirmar configuración pública de Google OAuth, callback del dominio definitivo y recorrido en móvil con una cuenta ajena a las de desarrollo                                           |
| Antes del lanzamiento    | Fotografías de demostración             | Crear un inventario realista con imágenes propias/autorizadas y sin datos personales para capturas                                                                                       |
| Antes del lanzamiento    | Presentación del producto               | Explicar «fotografía tus prendas, organiza tus armarios y encuentra dónde está cada cosa» y mostrar capturas antes del login                                                             |
| Antes del lanzamiento    | Idioma                                  | Confirmar español solamente con aviso visible o preparar inglés en los flujos principales                                                                                                |
| Antes del lanzamiento    | Precio y contacto                       | Gratuidad inicial y dlperezmartinez@gmail.com confirmados; incorporarlos a la presentación pública y soporte                                                                             |
| Antes del lanzamiento    | Marca                                   | Aprobar símbolo/logotipo; el favicon SVG y los iconos PWA ya existen, pero son provisionales                                                                                             |
| Antes del lanzamiento    | Galería                                 | Preparar al menos dos imágenes útiles; propuesta de cuatro más abajo                                                                                                                     |
| Recomendado              | Metadatos sociales                      | Hay título y description. Faltan Open Graph/Twitter, imagen social y URL canónica acordada                                                                                               |
| Recomendado              | Dominio                                 | `outify.vercel.app` funciona; dominio propio aporta identidad, no se ha comprobado como requisito de Product Hunt                                                                        |
| Opcional                 | Vídeo o demo                            | Vídeo corto que enseñe el flujo; sin retrasar un lanzamiento listo por producir un tráiler complejo                                                                                      |

El favicon no sustituye la miniatura de Product Hunt ni la imagen social. El
nombre tipográfico actual es usable como provisional; la aprobación de marca
sigue en [[Tareas/Definir identidad pública de Outify]]. No se prometen outfits,
IA, importaciones automáticas ni otras funciones ausentes del MVP.

## Alta en Product Hunt

Se necesita una cuenta **personal**, perfil completo y acceso para publicar.
No hace falta contratar a un hunter: puedes presentar tu propio producto. La
ayuda de acceso indica una semana de espera para cuentas nuevas, con acceso
anticipado al suscribirse a su newsletter; comprobar lo que muestre tu cuenta.
[Acceso para publicar](https://help.producthunt.com/en/articles/481909-how-can-i-get-access-to-post).

Preparar URL, nombre, tagline, descripción, categorías pertinentes, precio,
estado del producto, maker y primer comentario. La miniatura recomendada es
**240 × 240**; las imágenes de galería, **1270 × 760**, con al menos dos para
que la galería sea visible. La descripción admite **260 caracteres** según la
guía. El vídeo es opcional y usa una URL completa de YouTube no privada.
Se puede guardar un borrador y programar después.
[Cómo publicar](https://help.producthunt.com/en/articles/479557-how-to-post-a-product).

La guía consultada no fija explícitamente un máximo para la tagline; la propuesta
de abajo es deliberadamente breve. Confirmar todos los límites en el formulario
real, sin asumir los que citan guías antiguas.

Publicar no garantiza aparecer en la portada. Product Hunt prioriza productos
digitales disponibles que aporten utilidad, novedad, diseño o creatividad; una
lista de espera sin acceso inmediato no cumple sus criterios de destacado.
[Criterios de selección](https://help.producthunt.com/en/articles/9883485-product-hunt-featuring-guidelines).

Comprobar en el buscador interno si existe ya una ficha del mismo producto antes
de crearla. La búsqueda pública realizada no confirmó una ficha exacta de Outify;
eso no acredita disponibilidad de nombre, marca o dominio.

## Texto propuesto para la ficha

**Nombre:** Outify

**Tagline (39 caracteres):**

> Know what you own. Find where it lives.

**Descripción (213 caracteres):**

> Outify is a visual wardrobe inventory. Add photos of your clothes, map your closets, and give every item a place. Search your collection and see where each piece is stored. Private by default, with Google sign-in.

**Equivalente en español:**

Outify es un inventario visual de tu ropa. Añade fotos, representa tus armarios y
dale un lugar a cada artículo. Busca en tu colección y consulta dónde está guardada
cada prenda. Privado por defecto, con acceso mediante Google.

**URL:** usar el dominio definitivo decidido en identidad pública. La URL actual
es `https://outify.vercel.app`.

**Categorías:** escoger las disponibles en el formulario que correspondan a
organización personal, estilo de vida o productividad. No etiquetar como IA.

**Precio:** Free. Daniel confirmó el 2026-09-21 que el lanzamiento será gratuito
inicialmente. No anunciar «free forever»: no hay un compromiso de gratuidad perpetua.

**Maker:** Daniel Pérez Martínez, desde su cuenta personal de Product Hunt.

**Contacto público:** dlperezmartinez@gmail.com.

## Galería propuesta

1. **“Your wardrobe, at a glance”**. Vista real de un armario con zonas y prendas.
   Es la primera imagen: debe explicar el producto sin leer más texto.
2. **“Remember what you own”**. Cuadrícula con distintas prendas y búsqueda/filtros.
3. **“Give every item a place”**. Detalle del selector de ubicación y la misma
   prenda en su zona. Mostrar el mecanismo real de la aplicación.
4. **“Make your space your own”**. Editor con zonas y controles; variante móvil
   que muestre que se puede usar también con un dedo.

Usar capturas de la versión final y tipografía legible; no maquetas de funciones
inexistentes. Conservar paleta y tono de [[Decisiones visuales]]. Preparar aparte
una imagen social de 1200 × 630 como decisión de exportación para la web.

## Primer comentario del creador

Relato recibido el 2026-09-21. La revisión conserva la motivación original y
distingue el inventario disponible de los outfits guardados, que siguen siendo
una intención futura sin fecha comprometida. El nombre Outify no debe hacer
pensar que esa función ya existe.

### Versión revisada en español

Empecé Outify porque, cada vez que compraba un outfit completo, con el tiempo
acababa olvidando qué prendas había pensado combinar. Quería una aplicación
donde guardar esas combinaciones y consultarlas más adelante.

La idea fue evolucionando hasta convertirse en un inventario visual: puedes
dividir tus armarios en zonas, registrar tus prendas una a una y asignar cada
una a su lugar.

Guardar outfits sigue siendo la idea que dio origen al proyecto y una función
que quiero añadir en el futuro. Todavía no está disponible, pero encaja muy bien
con el inventario actual: saber qué ropa tienes y dónde está es una buena base
para recuperar tus combinaciones favoritas.

### Traducción al inglés

I started Outify because whenever I bought a complete outfit, I'd eventually
forget which pieces I'd planned to wear together. I wanted an app where I could
save those combinations and look them up later.

The idea evolved into a visual wardrobe inventory: you can divide your closets
into sections, add your clothes one by one, and assign each piece a place.

Saving outfits is still the idea that started the project, and it's a feature I
want to add in the future. It isn't available yet, but it fits naturally with
the inventory you can use today: knowing what you own and where it is provides
a useful foundation for keeping track of your favorite combinations.

Para el primer comentario, añadir «Hi Product Hunt! I'm Daniel, the maker of
Outify.» al principio y, opcionalmente, esta pregunta al final:

> I'd love to hear how you keep track of your clothes—and what would make Outify useful in your day-to-day life.

## Lanzamiento y seguimiento

Primero preparar borrador, revisar la previsualización y comprobar enlaces.
Después elegir fecha con tiempo para responder comentarios. La plataforma expresa
su calendario con referencia al Pacífico; confirmar la hora mostrada en el
formulario para esa fecha antes de convertirla a Europe/Madrid.

No se ha creado una cuenta, enviado un comentario ni registrado/publicado Outify
en Product Hunt durante esta revisión.
