## Cambio

<!-- Problema y comportamiento resultante. -->

## Versión acordada

<!-- Versión anterior → nueva; major/minor/patch, motivo y consenso del propietario. -->

## Verificación

<!-- Checks, Preview y límites de la comprobación. -->

## Despliegue

El push genera la Preview; el squash a `main` genera Production mediante la
integración Git de Vercel. Comprobar el SHA y estado por MCP de Vercel. Ante un
fallo, informar con logs y detenerse sin reintentos, correcciones ni rollback.
