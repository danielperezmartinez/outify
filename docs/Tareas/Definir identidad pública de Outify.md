---
Nombre: Definir identidad pública de Outify
Estado: En curso
Resumen: Crear la identidad pública que acompañará al sistema visual aprobado: logotipo, iconos, dominio y metadatos para navegador y redes sociales.
Decisiones: "[[Decisiones visuales]]; sistema Replicate wabi-sabi «Atelier sereno»"
Bloqueada: []
Fecha de creación: 2026-09-18T14:27:30+02:00
Última modificación: 2026-09-22
---

# Definir identidad pública de Outify

## Objetivo

Traducir el sistema visual aprobado en una identidad reconocible y utilizable en
la aplicación, el navegador, Vercel y futuras superficies de comunicación.

## Alcance

- Confirmar nombre escrito, tono de voz y descriptor corto del producto.
- Diseñar logotipo, símbolo y versiones monocromáticas.
- Preparar favicon, iconos PWA y `apple-touch-icon`.
- Elegir y configurar el dominio público.
- Definir título, descripción y metadatos Open Graph.
- Preparar una imagen social base y reglas de uso sobre fondos claros y oscuros.
- Verificar contraste, tamaños mínimos y coherencia con
  [[Decisiones visuales]].

## Criterios de finalización

- [ ] Logotipo y símbolo aprobados en variantes claras y oscuras.
- [x] Paquete de iconos exportado en formatos web necesarios.
- [ ] Dominio elegido y documentado.
- [x] Metadatos del navegador y redes sociales definidos.
- [ ] Recursos preparados en build local; pendientes integración y publicación.

## Fuera de alcance

- Campaña de marketing o manual de marca extenso.
- Rediseñar el sistema Replicate wabi-sabi ya aceptado.

## Avance durante el MVP

Se ha aplicado el nombre tipográfico Outify, un favicon SVG provisional y los
metadatos básicos de título/descripción. La identidad final, el dominio y los
recursos sociales siguen pendientes de esta tarea; no sustituyen su aprobación.

[[Añadir PWA y actualización de versiones]] aporta PNG de 192/512, maskable de
512 y apple-touch-icon de 180 derivados del favicon provisional. Son recursos
funcionales para instalar la aplicación; no aprueban una identidad definitiva.

La revisión [[Lanzamiento en Product Hunt]] del 2026-09-19 confirma los recursos
provisionales y añade como entregables de lanzamiento miniatura 240 × 240,
galería 1270 × 760 e imagen social propuesta 1200 × 630. El nombre, dominio y
diseño definitivos siguen pendientes de aprobación; no se han generado variantes
arbitrarias ni publicado un nuevo paquete de marca.

## Propuesta implementada · 2026-09-22

Símbolo propio: una O con compartimentos que remite al mapa de un armario.
`public/brand/symbol.svg` y `symbol-inverse.svg` son variantes monocromáticas.
Se aplica al favicon y se exportan iconos PWA 192/512, maskable 512 y Apple 180.
El nombre tipográfico mantiene Geologica y la paleta aprobada; no se cambia la
dirección visual. Miniatura 240, galería e imagen social en `public/launch`.

Portada ES/EN, Open Graph/Twitter y canónica preparados con el dominio actual
como propuesta, sin compra. Licencias tipográficas incluidas y fuentes autoalojadas.
Regeneración reproducible mediante `scripts/prepare-launch.mjs`. Build y revisión
visual local completadas; falta el visto bueno de Daniel al símbolo y recursos,
confirmar dominio y publicar. La aprobación del sistema visual anterior no se
interpreta como aprobación automática de esta marca.
