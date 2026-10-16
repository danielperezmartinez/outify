---
Nombre: Checklist de lanzamiento
Tipo: Checklist
Estado: Pendiente
Resumen: "Estado de la configuración fuera del código (gasto, Auth, firewall, secretos, plan y legal) que ningún test del repo comprueba. Bloquea la publicación en Product Hunt; la mayoría de puntos siguen sin revisar en los paneles."
Última revisión: 2026-10-16
Última modificación: 2026-10-17
---

# Checklist de lanzamiento

Marca cada punto al revisarlo en el panel y anota el valor real. Al terminar,
`Estado: Revisada` y actualiza `Última revisión`. Se revisa antes del primer
lanzamiento, al cambiar de plan y, como mínimo, una vez por trimestre.

Es un requisito previo de [[Tareas/Preparar lanzamiento en Product Hunt]]. Lo
legal y la baja remota se siguen en
[[Tareas/Preparar privacidad condiciones y tratamiento de datos]]. Las
checklists de gift-card, nocendland y perro-sanxe comparten el bloque de
Supabase: conviene revisarlas juntas.

## Supabase (devappsdpm-db)

- [x] Plan actual y sus límites anotados (BD, Storage, egress, MAU). En el plan
      gratuito, superar un límite restringe **todo** el proyecto, no solo esta
      app. Apps que lo comparten: gift-card, nocendland y perro-sanxe.
      _2026-10-16: plan Free; BD de 500 MB (17 MB usados), Storage de 1 GB
      (`outify-item-images`: 3 objetos, 10,8 MB). Riesgos en
      [[Tareas/Limitar Storage por usuario]] y
      [[Tareas/Limitar longitud de textos y filas por usuario]]._
- [ ] Tope de gasto (Spend Cap) activado o, si se desactiva, decisión escrita.
      _No aplica mientras siga en plan Free; revisar al cambiar de plan._
- [ ] Alertas de uso o de facturación configuradas y con destinatario real.
- [ ] Auth: el registro abierto/cerrado es intencionado; solo están activos los
      proveedores que se usan; URLs de redirección limitadas a los dominios
      propios.
- [ ] Auth: confirmación de email, protección contra contraseñas filtradas,
      CAPTCHA y límites de envío de emails/OTP revisados. _La auditoría de
      gift-card vio desactivada la protección contra contraseñas filtradas
      (ajuste de todo el proyecto)._
- [ ] Auth: SMTP propio si se envían correos a usuarios reales.
- [ ] Esquemas expuestos por la API: solo los necesarios. _2026-10-16:
      `public, graphql_public, gift_card, nocendland, outify, outify_dev`; los
      `*_private` no. Coordinación en [[Tareas/Coordinar pgrst.db_schemas entre apps]]._
- [ ] Copias de seguridad: lo que incluye el plan y si basta. _2026-10-16: plan
      Free sin copias de seguridad; la copia recuperable y el ensayo de
      restauración siguen pendientes en
      [[Tareas/Preparar privacidad condiciones y tratamiento de datos]]._
- [x] `pg_net`/`http` sin acceso de `anon` ni `authenticated` en el proyecto
      remoto. _2026-10-17: ninguna de las dos está instalada en `devappsdpm-db`
      (SELECT de solo lectura)._

## Vercel (outify)

- [ ] Plan adecuado al uso (Hobby no admite uso comercial). _Proyecto en
      Hobby; queda pendiente el DPA y la cobertura contractual en
      [[Tareas/Preparar privacidad condiciones y tratamiento de datos]]._
- [ ] Spend Management: tope y alertas configurados, y acción al superarlo.
- [ ] Firewall: reglas de límite de peticiones en rutas públicas y de API.
      _2026-10-17: sin configuración de Firewall (MCP); regla para `/api/`
      aprobada; hay que crearla en el panel, ver [[Tareas/Limitar peticiones en la API]]._
- [ ] Deployment Protection en Preview si las previews no deben ser públicas.
- [x] Variables secretas solo en los entornos que las usan (no en Preview si no
      hace falta) y marcadas como sensibles. _2026-10-17: `OUTIFY_SUPABASE_SECRET_KEY`
      y `CRON_SECRET` son `sensitive` y solo están en Production desde el 2026-10-17
      (ver [[Tareas/Revisar entornos de la clave secreta de Supabase]])._

## Legal y privacidad

- [x] Aviso legal y política de privacidad publicados y enlazados. _HTTP 200
      en privacidad y condiciones verificado en
      [[Tareas/Preparar privacidad condiciones y tratamiento de datos]]._
- [ ] Terceros que reciben datos (Supabase, Vercel, Google OAuth) listados en la
      política, con región de los datos. Véase [[Tratamiento de datos]].
- [ ] Revisión jurídica de los textos publicados. Pendiente.
- [ ] Prueba de baja remota de extremo a extremo (Storage y cron autenticado)
      antes de Product Hunt. Pendiente.
- [ ] Banner de cookies solo si hay cookies no técnicas, y funciona sin cargar
      nada antes del consentimiento.

## Accesibilidad

- [x] AXE en CI sin infracciones (`pnpm test:editor`, job `Verificar`).
- [ ] Revisión manual con teclado y lector de pantalla de los flujos principales.

## Revisiones

| Fecha | Quién | Notas |
| --- | --- | --- |
| 2026-10-17 | Agente (Claude Code) | Migración de límites aplicada y catálogo remoto verificado (solo SELECT); `pg_net`/`http` no instalados. |
| 2026-10-17 | Agente (Claude Code) | Variables de Vercel y Firewall consultados por MCP (solo lectura). |
| 2026-10-16 | Agente (Claude Code) | Checklist creada al montar el sistema. Valores tomados de la auditoría de solo lectura del 2026-10-16; los paneles de Supabase y Vercel no se han revisado aún. |
