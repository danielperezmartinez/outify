# Decisiones visuales y de estilos

Acuerdos sobre lenguaje visual, tokens y componentes de outify. Lista ligera
mientras el volumen sea bajo; se migrará a formato `.base` (como
[[Tareas/Tareas.base|Tareas]]) si crece.

| Decisión | Ámbito | Estado | Fecha |
|---|---|---|---|
| Wabi-sabi como dirección visual: calidez, sobriedad, materiales naturales, imperfección controlada y espacio para respirar | Lenguaje visual | Aceptada | 2026-09-18 |
| Usar `web-design-guidelines` como revisión de calidad de interfaz y accesibilidad, no como generador del estilo | Calidad UI | Aceptada | 2026-09-18 |
| Usar Replicate como referencia base, conservando su composición editorial, contraste técnico y trazos imperfectos sin copiar su marca | Tokens / componentes / layout | Aceptada | 2026-09-18 |
| Sustituir la paleta naranja de Replicate por los neutros de la referencia aportada y una escala salvia pastel | Color | Aceptada | 2026-09-18 |
| Usar Geologica para display, Atkinson Hyperlegible Next para cuerpo e interfaz e IBM Plex Mono para información técnica | Tipografía | Aceptada | 2026-09-18 |

## Encaje de las fuentes

[`web-design-guidelines`](https://github.com/vercel-labs/agent-skills/blob/main/skills/web-design-guidelines/SKILL.md)
encaja como puerta de calidad durante las revisiones de interfaz. Comprueba
semántica, foco, formularios, movimiento reducido, rendimiento, gestos y
alternativas de teclado. No define una identidad visual y, por tanto, se aplica
después de diseñar o implementar una pantalla, sin sustituir esta nota ni el
futuro sistema de tokens.

[`awesome-design-md`](https://github.com/VoltAgent/awesome-design-md) es un
catálogo de documentos `DESIGN.md`, no una skill ejecutable. Sus ejemplos se
usan como referencias parciales y nunca para copiar la identidad de otra marca.

## Selección wabi-sabi del catálogo

No existe una entrada etiquetada literalmente como «wabi-sabi». Esta selección
prioriza los rasgos compatibles con esa dirección y descarta sistemas fríos,
geométricos o visualmente estridentes.

### 1. Lovable — base calmada

[Abrir referencia](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/lovable/DESIGN.md)

- Parchment cream, carbón cálido, bordes suaves y profundidad casi plana.
- Tipografía humanista, ritmo editorial y sensación de cuaderno bien cuidado.
- Se valoró como base especialmente calmada para dejar protagonismo a las
  fotografías y al canvas.
- Riesgo: por sí sola puede resultar demasiado pulcra; Outify necesitaría añadir
  una irregularidad sutil propia en ilustraciones, separadores o texturas.

### 2. Replicate — cuaderno de taller

[Abrir referencia](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/replicate/DESIGN.md)

- Superficies crema y hueso, diagramas de trazo irregular y estética de
  cuaderno de laboratorio combinada con revista impresa.
- Aporta la imperfección humana que falta en Lovable y encaja especialmente con
  el editor visual.
- Riesgo: su naranja intenso y titulares muy grandes deben reducirse para no
  competir con las prendas ni cansar en una aplicación de uso frecuente.

### 3. Claude — editorial cálido

[Abrir referencia](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/claude/DESIGN.md)

- Fondo crema, tinta cálida, serif editorial, coral apagado y sombras escasas.
- Da una personalidad más artesanal y doméstica sin sacrificar claridad en
  formularios y paneles.
- Riesgo: el contraste entre serif y superficies oscuras puede acercarse más a
  una publicación que a una herramienta si se usa en toda la interfaz.

### 4. Mastercard — piedra suave y trazo orgánico

[Abrir referencia](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/mastercard/DESIGN.md)

- Lienzo putty-cream, formas redondeadas y arcos con irregularidad de dibujo a
  mano; transmite materialidad y movimiento sin recurrir a mucho volumen.
- Es una buena fuente para geometría, rutas visuales y microdecoración del
  canvas.
- Riesgo: las píldoras y círculos sobredimensionados no deben trasladarse a los
  controles densos del editor.

## Referencia elegida

El usuario eligió **Replicate** el 2026-09-18. Outify conserva como punto de
partida su mezcla de cuaderno de taller y publicación editorial, las superficies
planas, los bordes finos, los diagramas de trazo irregular y la convivencia de
tipografía expresiva con información técnica. No se conserva el naranja intenso
ni se copian nombres, logotipos o recursos de la marca original.

## Sistema aceptado · Replicate wabi-sabi «Atelier sereno»

Este sistema adapta Replicate a un producto de uso frecuente donde las
fotografías de las prendas y el editor SVG deben seguir siendo protagonistas.
La identidad se apoya en materia, silencio visual e imperfección controlada, no
en decoración abundante.

El usuario aprobó el conjunto completo el 2026-09-18. Los tokens, tipografías,
usos de color, textura y estados que siguen son vinculantes para la primera
implementación; cualquier cambio posterior se registrará como una nueva
decisión visual.

### Paleta neutra extraída de la referencia

Los valores son medianas tomadas en el centro de cada muestra de color de la
imagen facilitada. El JPEG puede introducir variaciones mínimas en los bordes;
estos valores se adoptan como tokens estables del sistema.

| Token | Color | Papel en la interfaz |
|---|---:|---|
| `rice-paper` | `#F8F7F5` | Fondo principal, formularios y lienzo vacío |
| `warm-plaster` | `#D9D6CF` | Paneles secundarios, estados vacíos y bloques editoriales |
| `mist-concrete` | `#D1D0CE` | Barras, tooltips claros y superficies técnicas |
| `dry-clay` | `#C3BBB0` | Armarios inactivos, chips neutros y contenedores destacados |
| `smoked-stone` | `#716D6C` | Superficie inversa, iconos secundarios y texto de baja jerarquía |

### Escala de verdes pastel

| Token | Color | Uso |
|---|---:|---|
| `sage-50` | `#F0F4EC` | Tinte muy suave, hover de filas y fondos informativos |
| `sage-100` | `#DEE7D8` | Zona seleccionada, badges y confirmaciones discretas |
| `sage-300` | `#B7C7A8` | Acción primaria con texto oscuro |
| `sage-500` | `#8FA37F` | Hover o estado activo intermedio |
| `sage-700` | `#52664E` | Foco, bordes activos y acciones sobre fondo claro |
| `sage-900` | `#334231` | Texto verde de máximo contraste y estados persistentes |

El pastel sigue siendo la señal dominante. `sage-700` y `sage-900` existen como
soporte funcional para foco, texto y contraste, no como grandes masas de color.

### Tinta y semántica

- `ink`: `#292724` para títulos, cuerpo y texto sobre verdes pastel.
- `body`: `#4F4B46` para texto secundario sobre superficies claras.
- `border`: `#B6B0A8` para divisores y contención sin sombra.
- `danger`: terracota apagado `#955F56`, reservado a eliminar o errores.
- `warning`: ocre tierra `#9A7848`, reservado a avisos; nunca sustituye al
  verde de las acciones habituales.

### Aplicación a los componentes de Outify

**Estructura general**

- Fondo `rice-paper`; paneles con `warm-plaster` o `mist-concrete` y bordes de
  un píxel. Las sombras quedan limitadas a menús flotantes y arrastre.
- El color llega por áreas amplias pero desaturadas, como papel, yeso y arcilla;
  no mediante gradientes brillantes.
- Radios contenidos: 6 px en controles, 10 px en tarjetas y 14 px en paneles
  grandes. Las pequeñas irregularidades proceden de líneas y texturas, no de
  deformar controles interactivos.

**Navegación y acciones**

- Acción primaria: `sage-300` con texto `ink`; hover `sage-500` y estado
  presionado `sage-700` con texto claro.
- Acciones secundarias: fondo transparente o `rice-paper`, borde `smoked-stone`
  y texto `ink`.
- Foco visible de 3 px con `sage-700`, separado del borde mediante un halo de
  `rice-paper`.

**Inventario de artículos**

- La fotografía ocupa el protagonismo; las tarjetas usan `rice-paper` y una
  línea `border`, sin filtros que alteren el color real de la ropa.
- Categorías y temporadas usan verdes suaves; los metadatos se apoyan en tinta
  y jerarquía tipográfica, no en una colección de colores distintos.
- El estado archivado usa `mist-concrete` y un icono/texto explícito; no depende
  solo de bajar la opacidad.

**Editor de armarios**

- El plano de trabajo usa `rice-paper`, con una retícula opcional casi
  imperceptible en `warm-plaster`.
- Armarios y zonas inactivas alternan `dry-clay`, `warm-plaster` y
  `mist-concrete` para distinguir niveles sin crear ruido.
- Una zona seleccionada usa relleno `sage-100`, borde `sage-700`, tiradores
  visibles y etiqueta; el color nunca es la única señal de selección.
- Guías de alineación y snapping usan `sage-700`. Las líneas de relación o
  ayuda pueden adoptar un trazo ligeramente irregular, pero la geometría que
  el usuario edita siempre permanece exacta.

### Tipografía y voz Replicate

- Mantener el contraste editorial de Replicate: titulares grandes y
  expresivos, cuerpo sobrio y etiquetas técnicas monoespaciadas.
- Fuentes abiertas aprobadas: `Geologica` para display,
  `Atkinson Hyperlegible Next` para cuerpo e interfaz e `IBM Plex Mono` para
  coordenadas, medidas y estados del editor.
- La interfaz usa frases breves y directas. La personalidad visual se concentra
  en títulos, vacíos e ilustraciones; los formularios priorizan legibilidad.

### Textura, ilustración y movimiento

- Textura de fibra o grano al 1–2 % únicamente en el shell y bloques
  editoriales. El canvas y las fotos permanecen limpios.
- Ilustraciones lineales y diagramas con variación de trazo sutil, como lápiz o
  tinta seca. No usar acuarelas genéricas ni manchas detrás de controles.
- Movimiento corto y táctil: 140–180 ms para controles y 220–260 ms para
  paneles. Las animaciones usan transformación y opacidad, son interrumpibles y
  respetan `prefers-reduced-motion`.

### Contraste validado para el sistema

- `ink` sobre `rice-paper`: 13,91:1.
- `ink` sobre `dry-clay`: 7,84:1.
- `ink` sobre `sage-300`: 8,33:1.
- `ink` sobre `sage-500`: 5,47:1.
- blanco sobre `sage-700`: 6,23:1.
- `sage-700` sobre `rice-paper`: 5,82:1.

Estas combinaciones superan WCAG AA para texto normal. En la implementación se
validarán también estados reales, tamaños, iconos y combinaciones no incluidas
en esta tabla mediante AXE y la revisión `web-design-guidelines`.

### Parámetros aprobados

- Los nombres de tokens descritos en esta nota son los nombres iniciales del
  sistema.
- `smoked-stone` se utiliza como superficie inversa y neutral de mayor peso.
- `Geologica`, `Atkinson Hyperlegible Next` e `IBM Plex Mono` forman la familia
  tipográfica inicial.
- La textura se limita al 1–2 % y queda fuera del canvas y de las fotografías.
- `sage-300` es la acción primaria; `sage-500` es su hover y `sage-700` su
  estado presionado, foco y borde activo.
