# Decisiones de arquitectura (ADR)

Registro de decisiones técnicas duraderas de outify: contexto, alternativas
consideradas y consecuencias. Sirve para no repetir una discusión ya cerrada
ni contradecir sin darse cuenta una decisión vigente.

[[Decisiones/Decisiones.base|Abrir el panel de decisiones]]

## Decisiones registradas

- [[Decisiones/ADR-0001 Supabase como plataforma backend]]
- [[Decisiones/ADR-0002 Modelo de datos inicial]]
- [[Decisiones/ADR-0003 pnpm exclusivo y seguridad de dependencias]]
- [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido]]
- [[Decisiones/ADR-0005 Arquitectura Angular orientada a features]]
- [[Decisiones/ADR-0006 Motor de edición con SVG nativo]]
- [[Decisiones/ADR-0007 Repositorio GitHub y despliegue en Vercel]]
- [[Decisiones/ADR-0008 Flujo Git con ramas cortas y squash]]
- [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase]]

## Cómo utilizarlo

1. Antes de discutir una decisión técnica duradera, revisar aquí si ya existe
   una ADR que la cubra (incluidas `Reemplazada` y `Obsoleta`, para conocer el
   histórico).
2. Una ADR **no se edita para cambiar la decisión**: se marca `Reemplazada` y
   se crea una nueva que la sustituye, enlazando ambas con `Reemplaza` /
   `Reemplazada por`.
3. Si una decisión afecta a una tarea, enlazar ambas notas mutuamente.

## Plantilla de nota

Nombre de fichero: `ADR-0001 Título de la decisión.md` (numeración
correlativa, no se reutiliza).

```markdown
---
Nombre: <Título de la decisión>
Número: 1
Estado: Propuesta
Resumen: <Qué se decide y por qué, entendible sin abrir la nota.>
Decisión: <La decisión en una frase.>
Consecuencias: <Impactos y compromisos clave que deben recordarse.>
Reemplaza: []
Reemplazada por: []
Fecha de creación: <AAAA-MM-DDTHH:mm:ss+ZZ:ZZ>
Última modificación: <AAAA-MM-DDTHH:mm:ss+ZZ:ZZ>
---

# ADR-0001 · <Título de la decisión>

## Contexto

<Fuerzas, restricciones y problema que motivan la decisión.>

## Decisión

<Qué se decide, de forma concreta y accionable.>

## Alternativas consideradas

- <Opción A> — <por qué se descartó o aceptó.>

## Consecuencias

- Positivas: <...>
- Negativas / compromisos: <...>
```

`Estado` ∈ `Propuesta` · `Aceptada` · `Rechazada` · `Obsoleta` · `Reemplazada`.
