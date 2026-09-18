---
Nombre: Automatizar CI-CD y previews en Vercel
Estado: Pendiente
Resumen: Automatizar los checks de pull request, los despliegues Preview y la promoción de main a Vercel Production después del primer despliegue manual.
Decisiones: "[[Decisiones/ADR-0003 pnpm exclusivo y seguridad de dependencias|ADR-0003]]; [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel|ADR-0007]]; [[Decisiones/ADR-0008 Flujo Git con ramas cortas y squash|ADR-0008]]; [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase|ADR-0009]]"
Bloqueada: []
Fecha de creación: 2026-09-18T14:27:30+02:00
Última modificación: 2026-09-18
---

# Automatizar CI-CD y previews en Vercel

## Objetivo

Convertir el flujo Git aceptado en un proceso reproducible que valide cada pull
request, genere una Preview segura y despliegue `main` en producción sin pasos
manuales innecesarios.

Se abordará después de que el usuario conecte GitHub y complete el primer
despliegue manual en Vercel.

## Alcance

- Configurar checks de pull request con pnpm 12.4.2.
- Ejecutar `pnpm install --frozen-lockfile`, tests y build de producción.
- Conectar las previews de Vercel a `outify_dev` y al bucket de desarrollo.
- Conectar Vercel Production a `outify` y al bucket estable.
- Definir checks obligatorios, protección de `main` y política de squash.
- Documentar promoción, rollback, variables por entorno y diagnóstico de fallos.
- Mantener secretos y credenciales fuera del repositorio.

## Criterios de finalización

- [ ] Cada pull request obtiene un resultado verificable de tests y build.
- [ ] Cada pull request elegible obtiene una URL Preview.
- [ ] Ninguna Preview escribe en los recursos estables de Supabase.
- [ ] Solo `main` despliega en Production.
- [ ] La protección de rama impide integrar si fallan los checks obligatorios.
- [ ] Existe una prueba documentada de rollback o restauración del despliegue.

## Fuera de alcance

- Cambiar la plataforma Vercel.
- Crear un segundo proyecto Supabase mientras se mantenga la restricción de
  coste actual.

## Base preparada por el MVP

`vercel.json` define instalación reproducible, build, rutas SPA y cabeceras.
`scripts/configure.mjs` selecciona automáticamente producción con `VERCEL_ENV=production`
y desarrollo en Preview. Siguen pendientes la conexión inicial del usuario y
los checks de GitHub/automatización, según el orden acordado.
