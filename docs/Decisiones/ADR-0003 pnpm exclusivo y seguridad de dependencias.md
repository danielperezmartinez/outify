---
Nombre: pnpm exclusivo y seguridad de dependencias
Número: 3
Estado: Aceptada
Resumen: Outify usa exclusivamente pnpm con versiones exactas, cuarentena de publicaciones, verificación de confianza y aprobación explícita de scripts de instalación.
Decisión: Usar pnpm 12.4.2 como único gestor y aplicar una política estricta contra ataques a la cadena de suministro.
Consecuencias: "Las instalaciones son más seguras y reproducibles; algunas actualizaciones recientes o scripts nativos requieren espera o aprobación manual y explícita."
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-17T23:03:55+02:00
Última modificación: 2026-09-17T23:03:55+02:00
---

# ADR-0003 · pnpm exclusivo y seguridad de dependencias

## Contexto

El scaffold original fijaba npm 10.8.3 y mantenía `package-lock.json`. El usuario
ha decidido usar únicamente pnpm y endurecer la instalación para reducir el
riesgo de paquetes comprometidos, scripts maliciosos y sustituciones en la
cadena de suministro.

## Decisión

- Fijar pnpm 12.4.2 en `packageManager` y `engines.pnpm`.
- Rechazar otros gestores mediante `preinstall`.
- Mantener exclusivamente `pnpm-lock.yaml`; eliminar `package-lock.json`.
- Guardar dependencias directas con versiones exactas.
- Configurar una antigüedad mínima estricta de siete días para cualquier versión
  nueva, incluidas las dependencias transitivas.
- Fallar si el registro no proporciona fecha de publicación.
- Aplicar `trustPolicy: no-downgrade` a publicaciones del último año y verificar
  también las entradas ya existentes en el lockfile.
- Bloquear fuentes transitivas exóticas como repositorios Git o tarballs
  externos.
- Verificar integridad y correspondencia de nombre, versión y contenido en el
  store de pnpm.
- Fallar ante cualquier script de instalación no revisado. Las autorizaciones se
  conceden únicamente a versiones exactas mediante `allowBuilds`.
- Exigir que `node_modules` corresponda al lockfile antes de ejecutar scripts.
- Usar `pnpm install --frozen-lockfile` en entornos reproducibles y CI cuando se
  incorpore.

## Scripts nativos autorizados inicialmente

- `@parcel/watcher@2.5.6`
- `esbuild@0.27.3`
- `lmdb@3.5.1`
- `msgpackr-extract@3.0.3`

Estas aprobaciones son exactas. Una versión nueva vuelve a requerir revisión.
Nunca se habilita `dangerouslyAllowAllBuilds`.

## Procedimiento para actualizar dependencias

1. Ejecutar la actualización con pnpm, nunca con otro gestor.
2. Revisar edad, procedencia, changelog y avisos de seguridad de las versiones.
3. Si aparece un script nuevo, inspeccionarlo y aprobar solo el paquete y la
   versión concretos; si no es imprescindible, mantenerlo bloqueado.
4. No añadir exclusiones globales a `minimumReleaseAge` ni `trustPolicy`.
5. Verificar `pnpm install --frozen-lockfile`, `pnpm build` y `pnpm test`.
6. Versionar conjuntamente `package.json`, `pnpm-workspace.yaml` y
   `pnpm-lock.yaml`.

## Alternativas consideradas

- Mantener npm — rechazado por decisión explícita del usuario y por disponer de
  menos controles integrados para este modelo de aprobación.
- Permitir varios gestores — rechazado porque produciría lockfiles y árboles de
  dependencias divergentes.
- Deshabilitar todos los scripts — descartado porque el toolchain actual necesita
  cuatro componentes nativos; se permite solo su versión exacta.
- Confiar sin revalidar el lockfile — descartado: un lockfile modificado también
  forma parte de la superficie de ataque.

## Consecuencias

- Positivas: instalaciones deterministas, ventana de reacción ante paquetes
  comprometidos, scripts bloqueados por defecto y política verificable en el
  repositorio.
- Negativas / compromisos: las publicaciones recientes esperan siete días y las
  actualizaciones de dependencias con scripts exigen revisión manual.
- Entorno local: si el comando global `pnpm` no está registrado, se usa
  `corepack pnpm`; ambos ejecutan la versión fijada del mismo gestor.

## Verificación inicial

- El lockfile superó la verificación de cadena de suministro de pnpm 12.4.2.
- El guard rechazó un `npm_config_user_agent` de npm.
- `pnpm build` completó correctamente.
- `pnpm test --watch=false` completó 2 pruebas correctamente.

## Fuentes

- [Mitigar ataques a la cadena de suministro](https://pnpm.io/supply-chain-security)
- [Configuración de resolución](https://pnpm.io/settings/dependency-resolution)
- [Configuración de scripts de construcción](https://pnpm.io/settings/build)
- [Configuración de integridad y lockfile](https://pnpm.io/settings/store)

## Tareas relacionadas

- [[Tareas/Completar plantillas de la bóveda de memoria]]
