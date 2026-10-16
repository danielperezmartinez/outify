---
Nombre: Reducir transferencia de imágenes
Estado: Pendiente
Resumen: "Hallazgo medio de la auditoría del 2026-10-16: las imágenes se suben sin redimensionar y las URL firmadas se regeneran cada 45 minutos, lo que gasta egress del plan gratuito compartido."
Decisiones: "[[Seguridad/Checklist de lanzamiento|Checklist de lanzamiento]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]"
Bloqueada: []
Fecha de creación: 2026-10-16
Última modificación: 2026-10-16
---

# Reducir transferencia de imágenes

## Hallazgo

Auditoría de solo lectura del 2026-10-16 (severidad **media**). Las fotografías
se guardan con su resolución original y las URL firmadas se regeneran cada 45
minutos, así que se vuelven a descargar imágenes ya vistas. El egress del plan
gratuito de `devappsdpm-db` es compartido.

## Alcance

- Redimensionar y comprimir en el cliente antes de subir (tamaño máximo
  acordado).
- Reutilizar URL firmadas vigentes y la caché del navegador; medir el egress
  antes y después.
- Encaja con [[Tareas/Limitar Storage por usuario]].

## Verificación

Pendiente. Antes de pasar a `Hecha`, aplicar la compuerta de
[[README#Comprobaciones y compuerta de "Hecha"]]: `supabase test db supabase/tests/security`
en verde en local y en el job `Seguridad`, con el test nuevo de este cambio en
el mismo PR.
