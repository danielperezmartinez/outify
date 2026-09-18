---
Nombre: Preparar privacidad condiciones y tratamiento de datos
Estado: Pendiente
Resumen: Definir y publicar los textos y flujos legales necesarios antes de admitir usuarios reales, incluyendo imágenes, OAuth, conservación y eliminación de datos.
Decisiones: "[[Decisiones/ADR-0001 Supabase como plataforma backend|ADR-0001]]; [[Decisiones/ADR-0002 Modelo de datos inicial|ADR-0002]]; [[Decisiones/ADR-0004 Aislamiento de Outify en Supabase compartido|ADR-0004]]; [[Decisiones/ADR-0009 Entornos lógicos en un único proyecto Supabase|ADR-0009]]"
Bloqueada: []
Fecha de creación: 2026-09-18T14:27:30+02:00
Última modificación: 2026-09-18
---

# Preparar privacidad, condiciones y tratamiento de datos

## Objetivo

Disponer antes del acceso de usuarios reales de información legal comprensible
y flujos que reflejen fielmente cómo Outify trata cuentas, fotografías y datos
de inventario.

## Alcance

- Determinar responsable, jurisdicción, público objetivo y canales de contacto.
- Redactar política de privacidad y condiciones de uso.
- Inventariar datos tratados por Google OAuth, Supabase, Vercel y la propia
  aplicación.
- Explicar finalidad, base jurídica, conservación, encargados y transferencias
  que resulten aplicables.
- Definir derechos del usuario y flujo de eliminación de cuenta, imágenes y
  datos relacionados.
- Definir reglas sobre propiedad y uso de las fotografías subidas.
- Revisar cookies, almacenamiento local y analítica cuando se decidan.
- Añadir enlaces y aceptación donde proceda en acceso, cuenta y pie de página.
- Someter los textos a revisión profesional adecuada antes del lanzamiento
  público; esta tarea de producto no sustituye asesoramiento jurídico.

## Criterios de finalización

- [ ] Inventario de datos y proveedores verificado contra la implementación.
- [ ] Política de privacidad y condiciones aprobadas y publicadas.
- [ ] Flujos de acceso y cuenta enlazan los documentos vigentes.
- [ ] La eliminación de cuenta y datos se ha probado de extremo a extremo.
- [ ] Conservación y borrado de imágenes coinciden con Storage y base de datos.
- [ ] Revisión jurídica o validación equivalente registrada antes del acceso de
      usuarios reales.

## Fuera de alcance

- Inventar requisitos legales sin conocer jurisdicción y público objetivo.
- Activar analítica o cookies no esenciales antes de definir su tratamiento.

## Inventario observado en la implementación del MVP

- Google proporciona identidad, correo, nombre y avatar; la autorización usa Auth/RLS.
- Supabase conserva fichas, etiquetas, geometría y fotografías privadas; las URLs
  firmadas de imagen duran una hora y se renuevan durante la sesión.
- El navegador conserva la sesión PKCE en almacenamiento local con clave propia
  por entorno. No se ha añadido analítica.
- Las fuentes aprobadas se cargan desde Google Fonts: incluir este proveedor en
  la revisión o autoalojarlas antes del lanzamiento si así se decide.
- Los borrados de artículos y las sustituciones de foto registran una cola de
  limpieza persistente. Se reintenta al abrir el inventario; una subida abortada
  se reserva una hora antes de considerarse huérfana.
- La eliminación integral de cuenta continúa fuera del MVP funcional y pendiente
  de esta tarea. No se han publicado textos legales provisionales.
