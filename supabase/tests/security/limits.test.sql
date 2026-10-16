-- Límites de longitud, de filas y de Storage (migración outify_security_limits).
-- Solo en base local, con rollback. Comprueba outify_dev; outify usa el mismo bloque.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;
select plan(12);

insert into auth.users(id, email) select ('55555555-0000-4000-8000-00000000000' || n)::uuid, 'limits-' || n || '@example.invalid'
from unnest(array['1', '2', '3', '4', '5', '6', '7', '8']) n;
insert into auth.sessions(id, user_id, created_at, updated_at)
select id, id, now(), now() from auth.users where email like 'limits-%';

-- A se da de alta con datos de OAuth demasiado largos.
set local role authenticated;
select set_config('request.jwt.claims', json_build_object(
  'sub', '55555555-0000-4000-8000-000000000001', 'session_id', '55555555-0000-4000-8000-000000000001',
  'role', 'authenticated',
  'user_metadata', json_build_object('full_name', repeat('n', 100), 'avatar_url', 'https://example.invalid/' || repeat('a', 3000))
)::text, true);
select outify_dev.activate_workspace(true);
select outify_dev.initialize_user_workspace();
select is((select length(display_name) from outify_dev.profiles), 80, 'El nombre de OAuth se recorta a 80 caracteres');
select is((select avatar_url from outify_dev.profiles), null, 'Un avatar de más de 2048 caracteres se descarta');

-- Longitud de textos.
select throws_ok(
  $$ update outify_dev.wardrobes set description = repeat('d', 1001) $$,
  '23514', null, 'La descripción del armario no supera 1000 caracteres');
select throws_ok(
  $$ select outify_dev.save_item(json_build_object('name', 'Camisa', 'category', 'top',
       'image_path', '55555555-0000-4000-8000-000000000001/a.png', 'brand', repeat('b', 81))::jsonb) $$,
  '23514', null, 'La marca no supera 80 caracteres');
select lives_ok(
  $$ update outify_dev.wardrobes set description = repeat('d', 1000), room = repeat('r', 80) $$,
  'Los textos en el límite se aceptan');

-- Topes de filas.
select lives_ok(
  $$ insert into outify_dev.wardrobes(name) select 'Armario ' || g from generate_series(2, 20) g $$,
  'Se pueden tener 20 armarios');
select throws_like(
  $$ insert into outify_dev.wardrobes(name) values ('Uno más') $$,
  'Has alcanzado el máximo de 20 armarios.', 'El armario 21 se rechaza');
select throws_like(
  $$ select outify_dev.save_item('{"name":"Etiquetada","category":"top","image_path":"55555555-0000-4000-8000-000000000001/t.png"}',
       null, array(select 'Etiqueta ' || g from generate_series(1, 21) g)) $$,
  'Has alcanzado el máximo de 20 etiquetas por prenda.', 'Una prenda no admite más de 20 etiquetas');

-- Cuota de Storage (como postgres, para insertar metadatos de tamaño directamente).
reset role;
insert into outify_dev_private.account_lifecycle(user_id, status, age_confirmed_at)
select id, 'active', now() from auth.users where email like 'limits-%' and email <> 'limits-1@example.invalid';
insert into storage.objects(bucket_id, name, metadata)
select 'outify-dev-item-images', '55555555-0000-4000-8000-000000000001/' || g || '.webp', '{"size":10}'
from generate_series(1, 500) g;
select throws_like(
  $$ insert into storage.objects(bucket_id, name, metadata)
     values ('outify-dev-item-images', '55555555-0000-4000-8000-000000000001/501.webp', '{"size":10}') $$,
  'Has alcanzado el espacio máximo para fotos%', 'La imagen 501 de un usuario se rechaza');
insert into storage.objects(bucket_id, name, metadata)
values ('outify-dev-item-images', '55555555-0000-4000-8000-000000000002/big.webp', json_build_object('size', 50 * 1024 * 1024 - 10)::jsonb);
select throws_like(
  $$ insert into storage.objects(bucket_id, name, metadata)
     values ('outify-dev-item-images', '55555555-0000-4000-8000-000000000002/more.webp', '{"size":11}') $$,
  'Has alcanzado el espacio máximo para fotos%', 'Un usuario no supera 50 MB');
insert into storage.objects(bucket_id, name, metadata)
select 'outify-dev-item-images', '55555555-0000-4000-8000-00000000000' || n || '/big.webp', json_build_object('size', 49 * 1024 * 1024)::jsonb
from unnest(array['3', '4', '5', '6']) n;
select throws_like(
  $$ insert into storage.objects(bucket_id, name, metadata)
     values ('outify-dev-item-images', '55555555-0000-4000-8000-000000000007/big.webp', json_build_object('size', 49 * 1024 * 1024)::jsonb) $$,
  'El almacenamiento de fotos de Outify está lleno%', 'El bucket de Outify no supera 250 MB');
select lives_ok(
  $$ insert into storage.objects(bucket_id, name, metadata)
     values ('outify-dev-item-images', '55555555-0000-4000-8000-000000000008/small.webp', '{"size":10}') $$,
  'Por debajo de los límites se sigue subiendo');

select * from finish();
rollback;
