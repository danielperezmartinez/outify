---
Nombre: Páginas públicas y enlaces legales
Tipo: Componentes y rutas
Área: Presentación
Feature: public
Estado: En revisión
Ámbito: Aplicación
Resumen: Portada ES/EN sin sesión, privacidad y condiciones públicas, enlaces legales compartidos y recursos de lanzamiento; pendientes publicación y cobertura contractual.
Fuente: src/app/public/landing.ts
Entrada pública: /; /en; /privacy; /terms; LegalLinks
Fecha de creación: 2026-09-22
Última modificación: 2026-09-22
---

`Landing` carga de forma diferida fuera del guard de sesión; `/en` usa datos de
ruta para la presentación inglesa. La app privada conserva el español y se avisa
antes de acceder. No se ofrecen outfits guardados como función existente.

`Legal` selecciona privacidad o condiciones mediante datos de ruta. La fuente del
texto público es `src/app/public/legal.ts`; la bóveda conserva fundamentos y
pendientes en [[Privacidad y condiciones - borrador]] y [[Tratamiento de datos]].

`LegalLinks` (`src/app/shared/ui/legal-links.ts`) reúne enlaces a documentos y
correo. Admite `label` para distinguir las regiones de navegación cuando aparecen
dos en una pantalla. Reutilizado en acceso, cuenta, pie privado y páginas públicas.

Recursos: `public/brand`, `public/launch`, `public/fonts`. Generadores en
`scripts/prepare-launch.mjs` y `scripts/vendor-fonts.mjs`; no forman parte de la
build ni leen cuentas reales. El generador de capturas rechaza orígenes remotos e
intercepta las llamadas de Supabase. Sus datos son ficticios y las prendas son
ilustraciones propias. No es una prueba del backend.

Verificación: `e2e/public.spec.ts`, incluido en `pnpm test:editor`, comprueba acceso
sin sesión, enlaces, idioma, AXE, móvil y ausencia de peticiones a Google Fonts.
La entrada pasa a vigente tras resolver pendientes y verificar la publicación.
