---
Nombre: Completar plantillas de la bóveda de memoria
Estado: Hecha
Resumen: Bóveda completada y catálogo técnico estrenado con sesión, inventario, editor SVG y utilidad de lectura paginada, implementados y verificados.
Decisiones: "[[Decisiones/ADR-0001 Supabase como plataforma backend|ADR-0001]]; [[Decisiones/ADR-0002 Modelo de datos inicial|ADR-0002]]; [[Decisiones/ADR-0003 pnpm exclusivo y seguridad de dependencias|ADR-0003]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]; [[Decisiones/ADR-0005 Arquitectura Angular orientada a features|ADR-0005]]; [[Decisiones/ADR-0006 Motor de edición con SVG nativo|ADR-0006]]; [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel|ADR-0007]]; [[Decisiones/ADR-0008 Flujo Git con ramas cortas y squash|ADR-0008]]; [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase|ADR-0009]]; lenguaje visual wabi-sabi con Replicate como referencia; código en inglés, comentarios y documentación en español."
Bloqueada: []
Fecha de creación: 2026-08-22T00:00:00+00:00
Última modificación: 2026-09-18
---

# Completar plantillas de la bóveda de memoria

## Objetivo

Al montar la bóveda `docs/` en outify (2026-08-22) se rellenaron las reglas
fundamentales derivables de `CLAUDE.md` y `GEMINI.md` (gestor de paquetes,
stack, comandos, buenas prácticas Angular/TypeScript), pero varias secciones
quedaron marcadas con `<!-- TODO -->` en [[README]] porque el proyecto está en
desarrollo muy temprano y aún no hay información real que migrar.

Esta tarea existe para volver sobre esas secciones cuando haya avance en el
proyecto.

## Criterios de finalización

- [x] `docs/README.md` → sección "Propósito del proyecto": **Hecho
      (2026-09-17)** — inventario visual de ropa unido a uno o varios armarios
      diseñados por el usuario en un canvas; las prendas se asignan de forma
      espacial e intuitiva y cuentan con una ficha propia.
- [x] `docs/README.md` → sección "Arquitectura objetivo": **Hecho
      (2026-09-18)** — arquitectura orientada a features, rutas lazy, stores de
      Signals con alcance local y motor SVG TypeScript desacoplado de Angular.
- [x] `docs/README.md` → "Reglas fundamentales del proyecto", punto 3
      (Versionado y despliegue): **Hecho (2026-08-22)** — SemVer +
      despliegue manual, sin CI/CD todavía.
- [x] `docs/README.md` → punto 4 (Idioma): **Hecho (2026-08-22)** — código
      (identificadores) en inglés; comentarios y documentación en español.
- [x] [[Decisiones visuales]]: **Hecho (2026-09-18)** — dirección wabi-sabi,
      uso de `web-design-guidelines` como control de calidad y selección de
      cuatro referencias de `awesome-design-md`. Replicate es la referencia
      aceptada; los neutros wabi-sabi, los acentos salvia y las tipografías
      Geologica, Atkinson Hyperlegible Next e IBM Plex Mono están aprobados.
- [x] [[Catálogo técnico]]: cuatro entradas vigentes que enlazan los contratos implementados y comprobados durante [[Implementar MVP funcional]].

## Verificación

La implementación ya dispone de servicios de sesión, stores de dominio, motor SVG puro y una utilidad compartida. Sus contratos se han registrado y comprobado con build, pruebas de dominio, integración Supabase y navegador.

## Resultado

Completada: todos los criterios de la bóveda tienen una implementación o decisión vigente.
