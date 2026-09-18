# Producto

Esta nota es la fuente de verdad del alcance funcional del primer MVP de
Outify. El propósito general del proyecto se resume en [[README#Propósito del proyecto]].

## Alcance del MVP

El MVP permitirá que cada usuario:

1. Acceda con su cuenta de Google.
2. Reciba una plantilla inicial con un armario y dos zonas, lista para usar.
3. Diseñe cada armario en un canvas mediante zonas rectangulares sencillas.
4. Registre artículos de ropa con una ficha y una imagen principal.
5. Arrastre un artículo a una zona del armario para indicar dónde está guardado.
6. Busque y filtre su inventario y consulte la ubicación actual de cada prenda.

Un artículo físico solo puede tener una ubicación actual. Puede estar colocado
en una zona o quedar sin asignar. En esta especificación, «artículo» incluye
prendas, calzado y accesorios.

La creación de conjuntos u outfits combinando varias prendas no forma parte de
este primer MVP. Se evaluará después de validar el inventario y la organización
de armarios.

## Pantallas

### 1. Acceso

Inicio de sesión mediante Google, con estados claros de carga y error. Incluye
enlaces a privacidad y condiciones cuando esos documentos existan.

En el primer acceso, la aplicación abre directamente la pantalla de armarios con
una plantilla que contiene un armario y dos zonas. La plantilla puede utilizarse
tal cual o modificarse; no se muestra antes un panel de inicio ni se obliga a
completar un asistente de configuración.

### 2. Armarios

Es la pantalla principal de la aplicación. Muestra en un canvas la organización
visual de los armarios del usuario y las zonas que contiene cada uno. En modo
normal permite consultar la distribución y organizar los artículos. Incluye una
acción clara para entrar en el modo de edición.

### 3. Edición de armarios

Modo específico de la pantalla de armarios para modificar su estructura:

- canvas con zoom, ajuste a pantalla y selección;
- creación, renombrado y eliminación de armarios;
- creación de zonas rectangulares;
- mover y redimensionar zonas;
- edición del nombre, tipo y color de una zona;
- guardado automático con indicador de estado.

La eliminación de una zona o un armario requiere confirmación y deja sus
artículos sin asignar. El usuario puede salir del modo de edición para volver a
la organización normal.

El MVP usa zonas planas, sin zonas anidadas. El armario puede representarse a
escala visual, pero no exige medidas físicas exactas.

### 4. Artículos

Lista de artículos creados, en cuadrícula con alternativa de lista. Permite buscar por nombre y
filtrar por categoría, color, temporada, etiquetas, armario y estado de
asignación. Incluye un botón principal «Crear artículo» y permite abrir cualquier
artículo existente para editarlo.

### 5. Formulario de artículo

El mismo formulario sirve para crear y editar. Cambian el título y la acción
final, pero se reutilizan los campos, las validaciones y la carga de imagen.
Muestra una previsualización de la foto y permite consultar o cambiar la
ubicación del artículo mediante selectores de armario y zona.

### 6. Cuenta

Muestra nombre, correo y avatar recibidos del proveedor de identidad. Permite
cerrar sesión y, más adelante, solicitar la eliminación de la cuenta y sus
datos.

## Campos funcionales

### Perfil

- Nombre visible.
- Correo electrónico, de solo lectura.
- Avatar, de solo lectura mientras proceda de Google.

### Armario

- Nombre, obligatorio.
- Ubicación doméstica, opcional; por ejemplo, dormitorio o recibidor.
- Descripción, opcional.
- Tamaño lógico del canvas.

### Zona del armario

- Nombre, obligatorio.
- Tipo: sección, balda, cajón, barra, caja u otro.
- Color visual.
- Posición horizontal y vertical.
- Anchura, altura y orden de superposición.

### Artículo

- Nombre, obligatorio.
- Imagen principal, obligatoria.
- Categoría: parte superior, parte inferior, vestido o mono, abrigo, calzado,
  accesorio, ropa interior, ropa deportiva u otra.
- Descripción, opcional.
- Color principal, opcional.
- Marca, opcional.
- Talla, opcional y en texto libre para admitir distintos sistemas.
- Material, opcional.
- Temporadas, selección múltiple entre primavera, verano, otoño e invierno.
- Etiquetas libres.
- Estado: activa o archivada.
- Armario y zona, opcionales; ambos vacíos representan «Sin asignar».

No se incluyen inicialmente precio, fecha de compra ni tienda: no son necesarios
para resolver el problema principal de inventario y ubicación.

## Asignación y cambio de ubicación

El usuario dispone de dos formas complementarias de ubicar un artículo:

1. En el formulario del artículo, una sección «Ubicación» contiene un selector
   de armario y otro de zona. «Sin asignar» es una opción explícita. El selector
   de zona solo está disponible después de elegir un armario; cambiar de armario
   limpia la zona anterior. Si el artículo ya está ubicado, se muestra el resumen
   «Armario → Zona» y un acceso «Ver en el armario».
2. En la pantalla visual de armarios, el artículo puede arrastrarse entre zonas
   para reorganizarlo de forma directa. Soltarlo en un espacio del canvas que no
   pertenezca a ninguna zona lo deja sin asignar.

Ambas interacciones modifican una única ubicación actual. El formulario es el
método universal, especialmente en móvil, y el arrastre es el método rápido y
visual para reorganizar. Al dejar un artículo sin asignar mediante arrastre, la
interfaz muestra una confirmación breve con la acción «Deshacer» para recuperar
su ubicación anterior si se soltó por error.

## Representación de artículos en el armario

Cada zona muestra las imágenes de sus artículos como miniaturas en una cuadrícula
compacta. Seleccionar una miniatura revela el nombre del artículo y permite abrir
su ficha. Cuando no caben todos, se muestran las miniaturas que admite el espacio
y un indicador «+N» con el número de artículos restantes; al activarlo se abre la
lista completa de esa zona.

## Archivado y eliminación de artículos

- Archivar un artículo lo retira de su zona y del inventario habitual, pero
  conserva su ficha y su imagen en una sección «Archivados».
- Restaurar un artículo archivado lo devuelve al inventario activo con estado
  «Sin asignar»; no recupera automáticamente su ubicación anterior.
- El borrado permanente solo está disponible desde «Archivados», exige una
  confirmación explícita y elimina también la imagen almacenada.
- Después de un borrado permanente no se ofrece recuperación desde la
  aplicación.

## Reglas funcionales clave

- Todos los armarios, zonas, artículos e imágenes pertenecen a un usuario.
- Un usuario nunca puede consultar ni modificar datos de otra cuenta.
- Un artículo puede estar sin asignar o en una sola zona, nunca en varias.
- Eliminar una zona o un armario no elimina sus artículos: los deja sin asignar.
- Archivar un artículo conserva su ficha, pero elimina su ubicación activa.
- Las imágenes privadas se sirven únicamente al propietario autenticado.

## Decisiones relacionadas

- [[Decisiones/ADR-0001 Supabase como plataforma backend]]
- [[Decisiones/ADR-0002 Modelo de datos inicial]]
