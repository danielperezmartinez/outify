---
Nombre: Sincronizar la bóveda con la skill 1.7.0
Estado: Hecha
Resumen: "Seguridad, coste y cumplimiento pasa de v2 a v3 y se monta el sistema Publicación v1 con la política común de las webs: guarda de pre-push contra código directo a main, sin exigir resolver conversaciones y Dependabot como código patch. ADR-0014 reemplaza a ADR-0013."
Decisiones: "[[Decisiones/ADR-0014 Guarda técnica y política común de publicación|ADR-0014]]"
Bloqueada: []
Fecha de creación: 2026-10-17
Última modificación: 2026-10-17
---

# Sincronizar la bóveda con la skill 1.7.0

## Objetivo

Poner la bóveda al día con la versión 1.7.0 de la skill que la mantiene:
sincronizar Seguridad a v3 y montar por ampliación el sistema Publicación con la
política común de publicación que el usuario fijó para sus cuatro webs, sin
duplicar lo que ya aplicaba
[[Tareas/Separar la publicación de código y bóveda|la tarea anterior]].

## Alcance

- README: Seguridad sellada en v3 con la viñeta que remite a
  [[../README#Publicación|Publicación]]; nueva sección Publicación v1, única
  fuente de la regla; la antigua regla 3 queda como enlace.
- [[Decisiones/ADR-0014 Guarda técnica y política común de publicación|ADR-0014]]
  reemplaza a ADR-0013.
- `.githooks/_rama_principal.sh`, cargado por `pre-push` antes del escaneo de
  gitleaks.
- Plantilla de PR y comentario del CI: solo enlazan a la sección Publicación.
- GitHub: `required_conversation_resolution` desactivado en la protección de
  `main` (con confirmación del usuario).
- Sin cambios en `vercel.json`, `.gitattributes` ni en los jobs del CI: ya eran
  equivalentes a la plantilla.

## Criterios de finalización

- [x] La guarda bloquea un push de código a `main`, deja pasar uno de solo
      `docs/` y no afecta a otras ramas (probado con commits existentes, sin
      subir nada).
- [x] PR de código integrada y Production `READY` en Vercel.
- [x] Protección de `main` sin resolución de conversaciones, leída de vuelta.

## Verificación

- Guarda probada en local alimentando `pre-push` con rangos reales: código a
  `main` → rechazado; solo `docs/` a `main` → pasa.
- PR danielperezmartinez/outify#8 integrada con squash (`70e46bf`, v0.4.5) con
  `Cambios`, `Verificar`, `Seguridad` y `Fugas` en verde. Production
  `dpl_3jiXeRG5aRKuiBCGb9ue4LMWspeK` `READY` en `https://outify.vercel.app`.
- Protección de `main` aplicada con confirmación del usuario y leída por la API:
  `required_conversation_resolution` desactivado; el resto sin cambios (checks
  strict, 0 aprobaciones, historial lineal, `enforce_admins` desactivado, sin
  force-push ni borrado).
