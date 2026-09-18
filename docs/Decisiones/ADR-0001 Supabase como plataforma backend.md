---
Nombre: Supabase como plataforma backend
Número: 1
Estado: Aceptada
Resumen: Supabase proporcionará autenticación, base de datos PostgreSQL y almacenamiento de imágenes para el MVP de Outify.
Decisión: Usar Supabase Auth, PostgreSQL y Storage como servicios backend de Outify.
Consecuencias: "Las cuentas, los datos y las imágenes compartirán una plataforma; será obligatorio aislar por usuario todas las tablas y objetos expuestos."
Reemplaza: []
Reemplazada por: []
Fecha de creación: 2026-09-17T21:01:43+02:00
Última modificación: 2026-09-17T21:01:43+02:00
---

# ADR-0001 · Supabase como plataforma backend

## Contexto

Outify necesita cuentas de usuario desde su primer MVP. Cada cuenta tendrá sus
propios armarios, prendas y fichas con imágenes, y los datos deberán estar
disponibles en una aplicación web más allá de un único dispositivo.

## Decisión

Usar Supabase para las tres capacidades backend iniciales:

- Supabase Auth para las cuentas de usuario, con acceso mediante Google como
  proveedor inicial.
- PostgreSQL para los datos de armarios, zonas, prendas y sus relaciones.
- Supabase Storage para las imágenes asociadas a las prendas.

Las tablas de esquemas expuestos tendrán RLS y políticas ajustadas al modelo de
acceso para garantizar que cada usuario solo pueda acceder a sus propios datos.
El acceso desde Angular se realizará mediante `@supabase/supabase-js` y los tipos
de la base de datos se generarán con la CLI de Supabase.

## Alternativas consideradas

- Persistencia exclusivamente local — descartada porque no cubre las cuentas ni
  la disponibilidad de los datos entre dispositivos.
- Proveedores separados para identidad, base de datos e imágenes — descartados
  para el MVP porque añaden integración y operación sin aportar una ventaja
  necesaria en el alcance definido.

## Consecuencias

- Positivas: una sola plataforma cubre identidad, datos y archivos; PostgreSQL
  permite modelar explícitamente las relaciones entre usuarios, armarios,
  ubicaciones y prendas.
- Negativas / compromisos: Outify dependerá de los servicios y límites de
  Supabase; será necesario configurar y verificar cuidadosamente RLS, las
  políticas de Storage y el flujo OAuth.

## Tareas relacionadas

- [[Tareas/Completar plantillas de la bóveda de memoria]]
