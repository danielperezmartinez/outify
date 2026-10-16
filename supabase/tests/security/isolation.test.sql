-- Aislamiento entre usuarios del sistema "Seguridad, coste y cumplimiento" (v1).
-- Recorre todas las tablas de outify_dev con dueño y comprueba, como otro usuario
-- y como anon, que no se pueden leer, modificar ni borrar datos ajenos.
-- Complementa a invariants.sql y outfits.sql. Solo en base local, con rollback.
begin;
create extension if not exists pgtap with schema extensions;
set local search_path = extensions, public;
select * from no_plan();

-- Cierto si la consulta no devuelve filas o el rol no tiene permiso.
create function pg_temp.denied_or_empty(query text) returns boolean language plpgsql as $$
declare total bigint;
begin
  execute format('with q as (%s) select count(*) from q', query) into total;
  return total = 0;
exception when insufficient_privilege then
  return true;
end $$;
grant execute on function pg_temp.denied_or_empty(text) to anon, authenticated;

-- Tablas con dueño y su columna de dueño.
create temp table _owned as
select c.relname as name, case when c.relname = 'profiles' then 'id' else 'user_id' end as owner
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'outify_dev' and c.relkind in ('r', 'p')
  and exists (
    select 1 from pg_attribute a
    where a.attrelid = c.oid and not a.attisdropped
      and a.attname = case when c.relname = 'profiles' then 'id' else 'user_id' end
  );
grant select on _owned to anon, authenticated;

insert into auth.users(id, email) values
 ('44444444-0000-4000-8000-00000000000a', 'security-a@example.invalid'),
 ('44444444-0000-4000-8000-00000000000b', 'security-b@example.invalid');
insert into auth.sessions(id, user_id, created_at, updated_at)
select id, id, now(), now() from auth.users
where id in ('44444444-0000-4000-8000-00000000000a', '44444444-0000-4000-8000-00000000000b');

-- Usuario A crea al menos una fila en cada tabla.
set local role authenticated;
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-00000000000a","session_id":"44444444-0000-4000-8000-00000000000a","role":"authenticated"}', true);
select outify_dev.activate_workspace(true);
select outify_dev.initialize_user_workspace();
select outify_dev.save_item('{"name":"Camisa","category":"top","image_path":"44444444-0000-4000-8000-00000000000a/shirt.png"}', (select min(id) from outify_dev.zones), array['Lino']);
select outify_dev.save_item('{"name":"Viejo","category":"top","image_path":"44444444-0000-4000-8000-00000000000a/old.png"}');
select outify_dev.save_outfit(0, 'Outfit', '', jsonb_build_array(jsonb_build_object('item_id', (select id from outify_dev.items where name = 'Camisa'))));
update outify_dev.items set status = 'archived' where name = 'Viejo';
select outify_dev.delete_archived_item((select id from outify_dev.items where name = 'Viejo'));

select isnt_empty(
  format('select 1 from outify_dev.%I where %I = %L', name, owner, '44444444-0000-4000-8000-00000000000a'),
  format('A ve sus filas de outify_dev.%s', name))
from _owned order by name;

-- Usuario B, con su propio espacio activo, no ve, modifica ni borra filas de A.
select set_config('request.jwt.claims', '{"sub":"44444444-0000-4000-8000-00000000000b","session_id":"44444444-0000-4000-8000-00000000000b","role":"authenticated"}', true);
select outify_dev.activate_workspace(true);
select outify_dev.initialize_user_workspace();

select ok(pg_temp.denied_or_empty(
  format('select 1 from outify_dev.%I where %I = %L', name, owner, '44444444-0000-4000-8000-00000000000a')),
  format('B no lee filas de A en outify_dev.%s', name))
from _owned order by name;
select ok(pg_temp.denied_or_empty(
  format('update outify_dev.%I set %I = %I where %I = %L returning 1', name, owner, owner, owner, '44444444-0000-4000-8000-00000000000a')),
  format('B no modifica filas de A en outify_dev.%s', name))
from _owned order by name;
select ok(pg_temp.denied_or_empty(
  format('delete from outify_dev.%I where %I = %L returning 1', name, owner, '44444444-0000-4000-8000-00000000000a')),
  format('B no borra filas de A en outify_dev.%s', name))
from _owned order by name;
select throws_ok(
  $$ insert into outify_dev.wardrobes(user_id, name) values ('44444444-0000-4000-8000-00000000000a', 'Ajeno') $$,
  '42501', null, 'B no crea armarios en nombre de A');
select throws_ok(
  $$ insert into outify_dev.tags(user_id, name) values ('44444444-0000-4000-8000-00000000000a', 'Ajena') $$,
  '42501', null, 'B no crea etiquetas en nombre de A');
select throws_ok(
  $$ insert into outify_dev.image_cleanup(user_id, path) values ('44444444-0000-4000-8000-00000000000a', '44444444-0000-4000-8000-00000000000a/x.png') $$,
  '42501', null, 'B no encola limpiezas en nombre de A');

-- anon no lista ni modifica ninguna tabla.
select set_config('request.jwt.claims', '{"role":"anon"}', true);
set local role anon;
select ok(pg_temp.denied_or_empty(format('select 1 from outify_dev.%I', name)),
  format('anon no lista outify_dev.%s', name))
from _owned order by name;
select ok(pg_temp.denied_or_empty(
  format('update outify_dev.%I set %I = %I returning 1', name, owner, owner)),
  format('anon no modifica outify_dev.%s', name))
from _owned order by name;

reset role;
select * from finish();
rollback;
