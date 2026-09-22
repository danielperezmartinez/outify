-- Fuente declarativa. outify_dev, outify_dev_private y outify-dev-item-images se expanden para ambos entornos.
create schema outify_dev;
create schema outify_dev_private;
revoke all on schema outify_dev, outify_dev_private from public, anon;
grant usage on schema outify_dev to authenticated;

create table outify_dev.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', avatar_url text,
 initialized_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table outify_dev.wardrobes (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid() references outify_dev.profiles(id) on delete cascade,
 name text not null check (length(trim(name)) between 1 and 120), room text not null default '', description text not null default '',
 position_x numeric not null default 0, position_y numeric not null default 0,
 width numeric not null default 800 check(width between 200 and 4000), height numeric not null default 600 check(height between 200 and 4000),
 z_index integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table outify_dev.zones (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid(), wardrobe_id bigint not null,
 name text not null check(length(trim(name)) between 1 and 120),
 type text not null default 'section' check(type in ('section','shelf','drawer','rail','box','other')),
 color text not null default '#D9D6CF' check(color ~ '^#[0-9a-fA-F]{6}$'),
 position_x numeric not null default 20 check(position_x >= 0), position_y numeric not null default 20 check(position_y >= 0),
 width numeric not null default 240 check(width between 80 and 4000), height numeric not null default 200 check(height between 80 and 4000),
 z_index integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id), foreign key(wardrobe_id,user_id) references outify_dev.wardrobes(id,user_id) on delete cascade
);
create table outify_dev.items (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid() references outify_dev.profiles(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 160), image_path text not null check(split_part(image_path,'/',1)=user_id::text),
 category text not null check(category in ('top','bottom','dress','outerwear','footwear','accessory','underwear','sportswear','other')),
 description text not null default '', primary_color text not null default '', brand text not null default '', size_label text not null default '', material text not null default '',
 seasons text[] not null default '{}' check(seasons <@ array['spring','summer','autumn','winter']::text[]),
 status text not null default 'active' check(status in ('active','archived')), archived_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id), unique(image_path)
);
create table outify_dev.item_locations (
 item_id bigint primary key, user_id uuid not null default auth.uid(), zone_id bigint not null, updated_at timestamptz not null default now(),
 foreign key(item_id,user_id) references outify_dev.items(id,user_id) on delete cascade,
 foreign key(zone_id,user_id) references outify_dev.zones(id,user_id) on delete cascade
);
create table outify_dev.tags (
 id bigint generated always as identity primary key, user_id uuid not null default auth.uid() references outify_dev.profiles(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 50), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create unique index tags_user_name on outify_dev.tags(user_id,lower(name));
create table outify_dev.item_tags (
 item_id bigint not null, tag_id bigint not null, user_id uuid not null default auth.uid(), primary key(item_id,tag_id),
 foreign key(item_id,user_id) references outify_dev.items(id,user_id) on delete cascade,
 foreign key(tag_id,user_id) references outify_dev.tags(id,user_id) on delete cascade
);
create index wardrobes_owner on outify_dev.wardrobes(user_id);
create index zones_owner on outify_dev.zones(user_id);
create index zones_parent on outify_dev.zones(wardrobe_id,user_id);
create index items_owner on outify_dev.items(user_id);
create index items_active on outify_dev.items(user_id,updated_at desc) where status='active';
create index locations_owner on outify_dev.item_locations(user_id);
create index locations_zone on outify_dev.item_locations(zone_id,user_id);
create index item_tags_owner on outify_dev.item_tags(user_id);
create index item_tags_tag on outify_dev.item_tags(tag_id,user_id);

alter table outify_dev.profiles enable row level security;
create policy owner on outify_dev.profiles for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
do $block$
declare t text;
begin
 foreach t in array array['wardrobes','zones','items','item_locations','tags','item_tags'] loop
  execute format('alter table outify_dev.%I enable row level security',t);
  execute format('create policy owner on outify_dev.%I for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()))',t);
 end loop;
end $block$;
grant select,insert,update,delete on all tables in schema outify_dev to authenticated;
grant usage,select on all sequences in schema outify_dev to authenticated;
revoke delete on outify_dev.profiles from authenticated;

create function outify_dev_private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end $$;
do $block$
declare t text;
begin
 foreach t in array array['profiles','wardrobes','zones','items','item_locations','tags'] loop
  execute format('create trigger touch_updated_at before update on outify_dev.%I for each row execute function outify_dev_private.touch_updated_at()',t);
 end loop;
end $block$;

create function outify_dev_private.sync_item_status() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status='archived' then
  new.archived_at=coalesce(new.archived_at,now());
  delete from outify_dev.item_locations where item_id=new.id;
 else new.archived_at=null;
 end if;
 return new;
end $$;
create trigger item_status before update on outify_dev.items for each row execute function outify_dev_private.sync_item_status();
create function outify_dev_private.check_active_location() returns trigger language plpgsql set search_path='' as $$
declare state text;
begin
 select status into state from outify_dev.items where id=new.item_id and user_id=new.user_id for update;
 if state is distinct from 'active' then raise exception 'Solo se pueden ubicar artículos activos'; end if;
 return new;
end $$;
create trigger active_location before insert or update on outify_dev.item_locations for each row execute function outify_dev_private.check_active_location();

create function outify_dev.initialize_user_workspace() returns void language plpgsql security invoker set search_path='' as $$
declare uid uuid := auth.uid(); wid bigint; initialized timestamptz;
begin
 if uid is null then raise exception 'Se requiere una sesión'; end if;
 insert into outify_dev.profiles(id,display_name,avatar_url) values(uid,coalesce(auth.jwt()->'user_metadata'->>'full_name',''),auth.jwt()->'user_metadata'->>'avatar_url') on conflict(id) do nothing;
 select initialized_at into initialized from outify_dev.profiles where id=uid for update;
 if initialized is not null then return; end if;
 insert into outify_dev.wardrobes(name,room) values('Mi armario','Dormitorio') returning id into wid;
 insert into outify_dev.zones(wardrobe_id,name,type,position_x,position_y,width,height,color) values
 (wid,'Para colgar','rail',24,24,360,552,'#DEE7D8'),(wid,'Doblado y a mano','shelf',408,24,368,552,'#D9D6CF');
 update outify_dev.profiles set initialized_at=now() where id=uid;
end $$;

create function outify_dev.save_item(item_data jsonb, target_zone bigint default null, tag_names text[] default '{}') returns bigint language plpgsql security invoker set search_path='' as $$
declare iid bigint; tid bigint; tag_name text;
begin
 if item_data->>'id' is null then
  insert into outify_dev.items(name,image_path,category) values(trim(item_data->>'name'),item_data->>'image_path',item_data->>'category') returning id into iid;
 else
  iid=(item_data->>'id')::bigint;
  perform 1 from outify_dev.items where id=iid for update;
  if not found then raise exception 'Artículo no disponible'; end if;
 end if;
 update outify_dev.items set name=trim(item_data->>'name'),image_path=item_data->>'image_path',category=item_data->>'category',
 description=coalesce(item_data->>'description',''),primary_color=coalesce(item_data->>'primary_color',''),brand=coalesce(item_data->>'brand',''),
 size_label=coalesce(item_data->>'size_label',''),material=coalesce(item_data->>'material',''),
 seasons=array(select jsonb_array_elements_text(coalesce(item_data->'seasons','[]'::jsonb))) where id=iid;
 delete from outify_dev.item_locations where item_id=iid;
 if target_zone is not null then insert into outify_dev.item_locations(item_id,zone_id) values(iid,target_zone); end if;
 delete from outify_dev.item_tags where item_id=iid;
 foreach tag_name in array tag_names loop
  tag_name=trim(tag_name);
  if tag_name='' then continue; end if;
  insert into outify_dev.tags(name) values(tag_name) on conflict(user_id,lower(name)) do update set name=excluded.name returning id into tid;
  insert into outify_dev.item_tags(item_id,tag_id) values(iid,tid) on conflict do nothing;
 end loop;
 return iid;
end $$;

-- Cola persistente: el borrado de la ficha y el trabajo de limpieza son atómicos.
create table outify_dev.image_cleanup (
 path text primary key, user_id uuid not null default auth.uid() references outify_dev.profiles(id) on delete cascade,
 created_at timestamptz not null default now(), check(split_part(path,'/',1)=user_id::text)
);
alter table outify_dev.image_cleanup enable row level security;
create policy owner on outify_dev.image_cleanup for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create index image_cleanup_owner on outify_dev.image_cleanup(user_id);
grant select,insert,delete on outify_dev.image_cleanup to authenticated;
create function outify_dev.delete_archived_item(item bigint) returns void language plpgsql security invoker set search_path='' as $$
declare image text;
begin
 select image_path into image from outify_dev.items where id=item and status='archived' for update;
 if not found then raise exception 'Solo se pueden eliminar artículos archivados'; end if;
 insert into outify_dev.image_cleanup(path) values(image) on conflict do nothing;
 delete from outify_dev.items where id=item;
end $$;
revoke delete on outify_dev.items from authenticated;
-- El permiso de borrado se concentra en una función privada que valida dueño y estado.
alter function outify_dev.delete_archived_item(bigint) set schema outify_dev_private;
alter function outify_dev_private.delete_archived_item(bigint) security definer;
create function outify_dev.delete_archived_item(item bigint) returns void language sql security invoker set search_path='' as $$ select outify_dev_private.delete_archived_item(item); $$;
-- La función privilegiada necesita filtro explícito porque su propietario omite RLS.
create or replace function outify_dev_private.delete_archived_item(item bigint) returns void language plpgsql security definer set search_path='' as $$
declare image text; uid uuid:=auth.uid();
begin
 select image_path into image from outify_dev.items where id=item and user_id=uid and status='archived' for update;
 if not found then raise exception 'Solo se pueden eliminar artículos archivados propios'; end if;
 insert into outify_dev.image_cleanup(path,user_id) values(image,uid) on conflict do nothing;
 delete from outify_dev.items where id=item and user_id=uid;
end $$;
grant usage on schema outify_dev_private to authenticated;
revoke all on all functions in schema outify_dev_private from public,anon,authenticated;
grant execute on function outify_dev_private.delete_archived_item(bigint) to authenticated;
revoke all on all functions in schema outify_dev from public,anon;
grant execute on all functions in schema outify_dev to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('outify-dev-item-images','outify-dev-item-images',false,8388608,array['image/jpeg','image/png','image/webp']);
create policy outify_dev_images_select on storage.objects for select to authenticated using(bucket_id='outify-dev-item-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy outify_dev_images_insert on storage.objects for insert to authenticated with check(bucket_id='outify-dev-item-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy outify_dev_images_delete on storage.objects for delete to authenticated using(bucket_id='outify-dev-item-images' and (storage.foldername(name))[1]=(select auth.uid())::text);

create index locations_item_owner on outify_dev.item_locations(item_id,user_id);
create index item_tags_item_owner on outify_dev.item_tags(item_id,user_id);
-- Encola la imagen anterior en la misma transacción que cambia la ficha.
create function outify_dev_private.track_item_image() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' and old.image_path<>new.image_path then
  insert into outify_dev.image_cleanup(path,user_id) values(old.image_path,old.user_id) on conflict do nothing;
 end if;
 delete from outify_dev.image_cleanup where path=new.image_path and user_id=new.user_id;
 return new;
end $$;
create trigger track_item_image after insert or update of image_path on outify_dev.items for each row execute function outify_dev_private.track_item_image();
revoke all on function outify_dev_private.track_item_image() from public,anon,authenticated;

alter table outify_dev.image_cleanup add column process_after timestamptz not null default now();

-- Restauración transaccional de zonas y ubicaciones del historial.
create or replace function outify_dev.restore_zone_state(
 target_id bigint, target_wardrobe bigint, expected_state jsonb, restored_state jsonb,
 assigned_items bigint[]
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_zone outify_dev.zones; next_zone outify_dev.zones; result jsonb;
begin
 if auth.uid() is null then raise exception 'Tu sesión ha caducado'; end if;
 perform 1 from outify_dev.wardrobes where id=target_wardrobe for update;
 if not found then raise exception 'El armario ya no está disponible'; end if;
 select * into current_zone from outify_dev.zones where id=target_id for update;
 if (case when current_zone.id is null then 'null'::jsonb else to_jsonb(current_zone)-'updated_at' end)
    is distinct from (case when expected_state is null or expected_state='null'::jsonb then 'null'::jsonb else expected_state-'updated_at' end)
 then raise exception 'La zona ha cambiado en otra sesión. Recarga antes de continuar.'; end if;
 if current_zone.id is not null and current_zone.wardrobe_id<>target_wardrobe then
   raise exception 'La zona no pertenece al armario';
 end if;
 if restored_state is null or restored_state='null'::jsonb then
   -- Rechaza una eliminación si las ubicaciones ya no coinciden con el snapshot.
   if (select coalesce(array_agg(item_id order by item_id),'{}'::bigint[]) from outify_dev.item_locations where zone_id=target_id)
      is distinct from (select coalesce(array_agg(v order by v),'{}'::bigint[]) from unnest(assigned_items) v)
   then raise exception 'Las prendas de esta zona han cambiado. Recarga antes de continuar.'; end if;
   delete from outify_dev.zones where id=target_id;
   return null;
 end if;
 next_zone=jsonb_populate_record(null::outify_dev.zones,restored_state);
 if next_zone.id is distinct from target_id or next_zone.wardrobe_id is distinct from target_wardrobe
    or next_zone.user_id is distinct from auth.uid() then raise exception 'Snapshot no válido'; end if;
 if current_zone.id is null then
   insert into outify_dev.zones(id,user_id,wardrobe_id,name,type,color,position_x,position_y,width,height,z_index,created_at)
   overriding system value values(next_zone.id,auth.uid(),target_wardrobe,next_zone.name,next_zone.type,next_zone.color,
    next_zone.position_x,next_zone.position_y,next_zone.width,next_zone.height,next_zone.z_index,next_zone.created_at)
   returning to_jsonb(zones.*) into result;
   -- No sustituye ubicaciones realizadas después de borrar la zona ni recupera artículos archivados.
   perform 1 from outify_dev.items where id=any(assigned_items) order by id for update;
   if (select count(*) from outify_dev.items where id=any(assigned_items) and status='active')<>cardinality(assigned_items)
      or exists(select 1 from outify_dev.item_locations where item_id=any(assigned_items))
   then raise exception 'Alguna prenda ha cambiado. No se ha restaurado la zona; recarga antes de continuar.'; end if;
   insert into outify_dev.item_locations(item_id,zone_id) select v,target_id from unnest(assigned_items) v;
 else
   update outify_dev.zones set name=next_zone.name,type=next_zone.type,color=next_zone.color,
    position_x=next_zone.position_x,position_y=next_zone.position_y,width=next_zone.width,height=next_zone.height,z_index=next_zone.z_index
   where id=target_id returning to_jsonb(zones.*) into result;
 end if;
 return result;
end $$;
revoke all on function outify_dev.restore_zone_state(bigint,bigint,jsonb,jsonb,bigint[]) from public,anon;
grant execute on function outify_dev.restore_zone_state(bigint,bigint,jsonb,jsonb,bigint[]) to authenticated;

-- Baja y admisión aisladas por aplicación y entorno. Nunca elimina auth.users.
create table outify_dev_private.account_lifecycle (
 user_id uuid primary key,
 status text not null default 'age_required' check(status in ('age_required','active','pending','deleted')),
 age_confirmed_at timestamptz,
 access_since timestamptz,
 requested_at timestamptz,
 completed_at timestamptz,
 lease_id uuid,
 lease_until timestamptz,
 next_attempt_at timestamptz not null default now(),
 attempts integer not null default 0,
 last_error text check(last_error in ('cleanup_retry'))
);
alter table outify_dev_private.account_lifecycle enable row level security;
revoke all on outify_dev_private.account_lifecycle from public,anon,authenticated;
create index account_deletion_queue on outify_dev_private.account_lifecycle(next_attempt_at) where status='pending';
-- Los perfiles existentes deben confirmar la edad; no se presume esa declaración.
insert into outify_dev_private.account_lifecycle(user_id) select id from outify_dev.profiles;

create function outify_dev_private.workspace_active() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from outify_dev_private.account_lifecycle a join auth.sessions s on s.user_id=a.user_id
  where a.user_id=auth.uid() and a.status='active' and a.age_confirmed_at is not null
  and s.id=nullif(auth.jwt()->>'session_id','')::uuid and (s.not_after is null or s.not_after>now())
  and (a.access_since is null or s.created_at>a.access_since));
$$;
create function outify_dev_private.require_live_session() returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.sessions where id=nullif(auth.jwt()->>'session_id','')::uuid
  and user_id=auth.uid() and (not_after is null or not_after>now())) then
  raise exception 'Vuelve a iniciar sesión para continuar';
 end if;
end $$;
create function outify_dev_private.get_workspace_status() returns text
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Se requiere una sesión'; end if;
 if exists(select 1 from outify_dev_private.account_lifecycle where user_id=auth.uid() and status='active')
  and not outify_dev_private.workspace_active() then return 'reauth_required'; end if;
 return coalesce((select status from outify_dev_private.account_lifecycle where user_id=auth.uid()),'age_required');
end $$;
create function outify_dev.get_workspace_status() returns text language sql security invoker set search_path='' as $$
 select outify_dev_private.get_workspace_status();
$$;

-- Serializa las escrituras ya iniciadas con la solicitud de baja.
create function outify_dev_private.guard_workspace_write() returns trigger
language plpgsql security definer set search_path='' as $$
declare state text;
begin
 if auth.role()='authenticated' then
  select status into state from outify_dev_private.account_lifecycle where user_id=auth.uid() for share;
  if state is distinct from 'active' or not outify_dev_private.workspace_active() then raise exception 'Tu espacio no está activo'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
do $block$
declare t text;
begin
 foreach t in array array['profiles','wardrobes','zones','items','item_locations','tags','item_tags','image_cleanup'] loop
  execute format('create policy workspace_access on outify_dev.%I as restrictive for all to authenticated using ((select outify_dev_private.workspace_active())) with check ((select outify_dev_private.workspace_active()))',t);
  execute format('create trigger guard_workspace_write before insert or update or delete on outify_dev.%I for each row execute function outify_dev_private.guard_workspace_write()',t);
 end loop;
end $block$;
revoke insert,delete on outify_dev.profiles from authenticated;

alter function outify_dev.initialize_user_workspace() set schema outify_dev_private;
alter function outify_dev_private.initialize_user_workspace() security definer;
create function outify_dev.initialize_user_workspace() returns void
language plpgsql security invoker set search_path='' as $$
begin
 if not outify_dev_private.workspace_active() then raise exception 'Confirma tu acceso a Outify antes de continuar'; end if;
 perform outify_dev_private.initialize_user_workspace();
end $$;

create function outify_dev_private.activate_workspace(age_confirmed boolean, start_new boolean) returns void
language plpgsql security definer set search_path='' as $$
declare state outify_dev_private.account_lifecycle;
begin
 perform outify_dev_private.require_live_session();
 if age_confirmed is distinct from true then raise exception 'Debes tener al menos 14 años para crear una cuenta'; end if;
 insert into outify_dev_private.account_lifecycle(user_id) values(auth.uid()) on conflict do nothing;
 select * into state from outify_dev_private.account_lifecycle where user_id=auth.uid() for update;
 if state.status='pending' then raise exception 'La eliminación sigue en curso'; end if;
 if state.status='deleted' then
  if start_new is distinct from true then raise exception 'Confirma que quieres crear un espacio nuevo'; end if;
  if not exists(select 1 from auth.sessions where id=(auth.jwt()->>'session_id')::uuid
    and user_id=auth.uid() and created_at>state.completed_at) then
   raise exception 'Vuelve a iniciar sesión para crear un espacio nuevo';
  end if;
 end if;
 update outify_dev_private.account_lifecycle set status='active',age_confirmed_at=coalesce(age_confirmed_at,now()),
  access_since=case when state.status='deleted' then state.completed_at else access_since end,
  requested_at=null,completed_at=null,lease_id=null,lease_until=null,last_error=null,attempts=0
 where user_id=auth.uid();
 perform outify_dev_private.initialize_user_workspace();
end $$;
create function outify_dev.activate_workspace(age_confirmed boolean, start_new boolean default false) returns void
language sql security invoker set search_path='' as $$ select outify_dev_private.activate_workspace(age_confirmed,start_new); $$;

create function outify_dev_private.request_account_deletion() returns text
language plpgsql security definer set search_path='' as $$
declare state text;
begin
 perform outify_dev_private.require_live_session();
 insert into outify_dev_private.account_lifecycle(user_id) values(auth.uid()) on conflict do nothing;
 select status into state from outify_dev_private.account_lifecycle where user_id=auth.uid() for update;
 if state in ('pending','deleted') then return state; end if;
 if state='active' and not outify_dev_private.workspace_active() then raise exception 'Vuelve a iniciar sesión para continuar'; end if;
 update outify_dev_private.account_lifecycle set status='pending',requested_at=clock_timestamp(),next_attempt_at=now(),
  age_confirmed_at=null,lease_id=null,lease_until=null,last_error=null where user_id=auth.uid();
 return 'pending';
end $$;
create function outify_dev.request_account_deletion() returns text language sql security invoker set search_path='' as $$
 select outify_dev_private.request_account_deletion();
$$;

-- Restrictiva: otra política permisiva del proyecto no puede abrir este bucket.
create policy outify_dev_workspace_images on storage.objects as restrictive for all to authenticated,anon
using(bucket_id<>'outify-dev-item-images' or ((storage.foldername(name))[1]=auth.uid()::text and (select outify_dev_private.workspace_active())))
with check(bucket_id<>'outify-dev-item-images' or ((storage.foldername(name))[1]=auth.uid()::text and (select outify_dev_private.workspace_active())));

create function outify_dev_private.guard_image_write() returns trigger
language plpgsql security definer set search_path='' as $$
declare path text; image_bucket text; state text;
begin
 if tg_op='DELETE' then path=old.name; image_bucket=old.bucket_id;
 else path=new.name; image_bucket=new.bucket_id; end if;
 -- El worker usa service_role; los tokens de subida firmados también deben respetar la baja.
 if image_bucket='outify-dev-item-images' and (tg_op<>'DELETE' or coalesce(auth.role(),'')<>'service_role') then
  select status into state from outify_dev_private.account_lifecycle where user_id=split_part(path,'/',1)::uuid for share;
  if state is distinct from 'active' then raise exception 'El espacio de estas imágenes no está activo'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
create trigger outify_dev_guard_image_write before insert or update or delete on storage.objects
for each row execute function outify_dev_private.guard_image_write();

-- RPC de mantenimiento: solo service_role. IDs y leases nunca vienen del formulario.
create function outify_dev_private.claim_account_deletion(target_user uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 with candidate as (
  select user_id from outify_dev_private.account_lifecycle where status='pending'
   and (target_user is null or user_id=target_user) and next_attempt_at<=now()
   and (lease_until is null or lease_until<now()) order by next_attempt_at,user_id for update skip locked limit 1
 ), claimed as (
  update outify_dev_private.account_lifecycle s set lease_id=gen_random_uuid(),lease_until=now()+interval '5 minutes',attempts=attempts+1
  from candidate c where s.user_id=c.user_id returning s.user_id,s.lease_id
 ) select to_jsonb(claimed) into result from claimed;
 return result;
end $$;
create function outify_dev.claim_account_deletion(target_user uuid default null) returns jsonb
language sql security invoker set search_path='' as $$ select outify_dev_private.claim_account_deletion(target_user); $$;

create function outify_dev_private.account_deletion_batch(target_user uuid, claim uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 if not exists(select 1 from outify_dev_private.account_lifecycle where user_id=target_user and lease_id=claim
  and lease_until>now() and status='pending') then raise exception 'Trabajo no disponible'; end if;
 return (select coalesce(jsonb_agg(name),'[]'::jsonb) from (
  select name from storage.objects where bucket_id='outify-dev-item-images'
   and name like target_user::text||'/%' order by name limit 100
 ) batch);
end $$;
create function outify_dev.account_deletion_batch(target_user uuid, claim uuid) returns jsonb
language sql security invoker set search_path='' as $$ select outify_dev_private.account_deletion_batch(target_user,claim); $$;

create function outify_dev_private.finish_account_deletion(target_user uuid, claim uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare state outify_dev_private.account_lifecycle;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 select * into state from outify_dev_private.account_lifecycle where user_id=target_user for update;
 if state.status is distinct from 'pending' or state.lease_id is distinct from claim or state.lease_until is null or state.lease_until<=now()
 then raise exception 'Trabajo no disponible'; end if;
 if exists(select 1 from storage.objects where bucket_id='outify-dev-item-images' and name like target_user::text||'/%')
 then raise exception 'Quedan imágenes pendientes'; end if;
 -- Las URLs de subida previamente firmadas duran 2 h; se hace un último barrido después.
 if state.requested_at+interval '2 hours 5 minutes'>now() then
  update outify_dev_private.account_lifecycle set lease_id=null,lease_until=null,
   next_attempt_at=state.requested_at+interval '2 hours 5 minutes',last_error=null where user_id=target_user;
  return false;
 end if;
 delete from outify_dev.profiles where id=target_user;
 update outify_dev_private.account_lifecycle set status='deleted',completed_at=now(),lease_id=null,lease_until=null,last_error=null
 where user_id=target_user;
 return true;
end $$;
create function outify_dev.finish_account_deletion(target_user uuid, claim uuid) returns boolean
language sql security invoker set search_path='' as $$ select outify_dev_private.finish_account_deletion(target_user,claim); $$;

create function outify_dev_private.defer_account_deletion(target_user uuid, claim uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 update outify_dev_private.account_lifecycle set lease_id=null,lease_until=null,next_attempt_at=now()+interval '15 minutes',last_error='cleanup_retry'
 where user_id=target_user and lease_id=claim and status='pending';
end $$;
create function outify_dev.defer_account_deletion(target_user uuid, claim uuid) returns void
language sql security invoker set search_path='' as $$ select outify_dev_private.defer_account_deletion(target_user,claim); $$;

revoke all on function outify_dev_private.workspace_active(),outify_dev_private.require_live_session(),outify_dev_private.get_workspace_status(),
 outify_dev_private.guard_workspace_write(),outify_dev_private.guard_image_write(),outify_dev_private.initialize_user_workspace(),
 outify_dev_private.activate_workspace(boolean,boolean),outify_dev_private.request_account_deletion(),
 outify_dev_private.claim_account_deletion(uuid),outify_dev_private.account_deletion_batch(uuid,uuid),
 outify_dev_private.finish_account_deletion(uuid,uuid),outify_dev_private.defer_account_deletion(uuid,uuid)
 from public,anon,authenticated;
grant execute on function outify_dev_private.workspace_active() to authenticated,anon;
grant execute on function outify_dev_private.get_workspace_status(),outify_dev_private.initialize_user_workspace(),
 outify_dev_private.activate_workspace(boolean,boolean),outify_dev_private.request_account_deletion() to authenticated;
grant usage on schema outify_dev_private,outify_dev to service_role;
grant execute on function outify_dev_private.claim_account_deletion(uuid),outify_dev_private.account_deletion_batch(uuid,uuid),
 outify_dev_private.finish_account_deletion(uuid,uuid),outify_dev_private.defer_account_deletion(uuid,uuid) to service_role;
revoke all on function outify_dev.initialize_user_workspace(),outify_dev.get_workspace_status(),outify_dev.activate_workspace(boolean,boolean),outify_dev.request_account_deletion(),
 outify_dev.claim_account_deletion(uuid),outify_dev.account_deletion_batch(uuid,uuid),outify_dev.finish_account_deletion(uuid,uuid),outify_dev.defer_account_deletion(uuid,uuid)
 from public,anon,authenticated;
grant execute on function outify_dev.initialize_user_workspace(),outify_dev.get_workspace_status(),outify_dev.activate_workspace(boolean,boolean),outify_dev.request_account_deletion() to authenticated;
grant execute on function outify_dev.claim_account_deletion(uuid),outify_dev.account_deletion_batch(uuid,uuid),outify_dev.finish_account_deletion(uuid,uuid),outify_dev.defer_account_deletion(uuid,uuid) to service_role;
