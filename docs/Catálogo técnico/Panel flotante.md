---
Nombre: Panel flotante
Tipo: Componente
Área: Interfaz compartida
Feature: shared
Estado: Vigente
Ámbito: Aplicación
Resumen: Panel de contenido proyectado con botón, backdrop, cierre exterior y Escape, retorno de foco y salida natural mediante Tab.
Fuente: src/app/shared/ui/popover.ts
Entrada pública: Popover; input label
Fecha de creación: 2026-09-19
Última modificación: 2026-09-19
---

`app-popover` recibe una etiqueta y proyecta controles sin conocer el dominio.
Mantiene los filtros del consumidor al cerrar. En móvil centra el panel dentro
del ancho disponible. No usa `role=menu`: admite formularios, no solo comandos.

La norma de interacción vive en [[Decisiones visuales]]. Primer consumidor:
`ItemList`, botón «Más filtros».
