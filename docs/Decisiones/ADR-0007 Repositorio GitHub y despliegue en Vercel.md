---
Nombre: Repositorio GitHub y despliegue en Vercel
Número: 7
Estado: Reemplazada
Resumen: El código se versionará en GitHub y la aplicación Angular se desplegará en Vercel; el usuario realizará la conexión y el primer despliegue antes de automatizar el flujo.
Decisión: Usar la rama local main, el repositorio GitHub danielperezmartinez/outify como origin y Vercel como plataforma de despliegue.
Consecuencias: "El código queda preparado para un flujo GitHub–Vercel, pero el primer push, la creación del proyecto en Vercel y la futura política de CI/CD siguen siendo acciones separadas."
Reemplaza: []
Reemplazada por: "[[ADR-0010 Publicaciones acordadas y CI-CD mediante Git]]"
Fecha de creación: 2026-09-18T09:56:11+02:00
Última modificación: 2026-09-18
---

# ADR-0007 · Repositorio GitHub y despliegue en Vercel

## Contexto

El proyecto aún no tenía repositorio Git local ni destino de despliegue
definitivo. El repositorio remoto indicado está vacío y el usuario realizará el
primer despliegue conectándolo desde Vercel.

## Decisión

- Inicializar Git local con `main` como rama inicial.
- Configurar `origin` con
  `https://github.com/danielperezmartinez/outify`.
- Usar Vercel como destino del frontend Angular.
- El usuario realizará el primer push que corresponda y creará/conectará el
  proyecto desde Vercel.
- La automatización, los checks obligatorios, los entornos de preview y la
  estrategia de promoción se definirán después del primer despliegue.
- No se almacenarán secretos de Supabase en Git. Las variables se configurarán
  por entorno cuando se prepare el despliegue.

## Alternativas consideradas

- Mantener el proyecto sin remoto — descartado porque impediría el flujo de
  despliegue indicado.
- Desplegar ahora mediante CLI — descartado porque el usuario ha reservado para
  sí la creación y el primer despliegue desde GitHub.
- Definir CI/CD completo ahora — pospuesto hasta disponer del primer despliegue
  y de los checks reales del proyecto.

## Consecuencias

- Positivas: historial local preparado, remoto inequívoco y plataforma de
  despliegue decidida.
- Negativas / compromisos: todavía no hay commit, push, proyecto Vercel ni flujo
  automatizado; se definirán cuando el usuario complete el primer despliegue.

## Tareas relacionadas

- [[Tareas/Completar plantillas de la bóveda de memoria]]
