---
Nombre: Sesión y cliente Supabase
Tipo: Servicios
Área: Plataforma
Feature: platform
Estado: Vigente
Ámbito: Aplicación
Resumen: Cliente tipado Supabase con esquema y bucket por entorno, sesión Google PKCE, guard y shell con inicialización idempotente.
Fuente: src/app/platform/backend.ts
Entrada pública: Backend; Session; sessionGuard
Fecha de creación: 2026-09-18
Última modificación: 2026-09-21
---

La configuración se genera con `scripts/configure.mjs`. Solo se admite una clave
publicable. `Session` expone el usuario como Signal de solo lectura. El shell
consulta la admisión después del guard y solo inicializa espacios activos.
La declaración de 14 años se guarda en el backend. El cierre de sesión es local
y limpia el estado cliente; no borra la identidad compartida. Véase
[[Baja y admisión de cuentas]]. Los errores permiten reintentar.

Contratos completos en `src/app/platform/`. Relacionado con [[Producto]],
[[Decisiones/ADR-0001 Supabase como plataforma backend]] y
[[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase]].
