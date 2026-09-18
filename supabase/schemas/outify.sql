-- Fuente declarativa. outify, outify_private y outify-item-images se expanden para ambos entornos.
create schema outify;
create schema outify_private;
revoke all on schema outify, outify_private from public, anon;
grant usage on schema outify to authenticated;

create table outify.profiles (
 id uuid primary key references auth.users(id) on delete cascade,
 display_name text not null default '', avatar_url text,
 initialized_at timestamptz, created_at timestamptz not null default now(), updated_at timestamptz not null default now()
);
create table outify.wardrobes (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid() references outify.profiles(id) on delete cascade,
 name text not null check (length(trim(name)) between 1 and 120), room text not null default '', description text not null default '',
 position_x numeric not null default 0, position_y numeric not null default 0,
 width numeric not null default 800 check(width between 200 and 4000), height numeric not null default 600 check(height between 200 and 4000),
 z_index integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create table outify.zones (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid(), wardrobe_id bigint not null,
 name text not null check(length(trim(name)) between 1 and 120),
 type text not null default 'section' check(type in ('section','shelf','drawer','rail','box','other')),
 color text not null default '#D9D6CF' check(color ~ '^#[0-9a-fA-F]{6}$'),
 position_x numeric not null default 20 check(position_x >= 0), position_y numeric not null default 20 check(position_y >= 0),
 width numeric not null default 240 check(width between 80 and 4000), height numeric not null default 200 check(height between 80 and 4000),
 z_index integer not null default 0, created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id), foreign key(wardrobe_id,user_id) references outify.wardrobes(id,user_id) on delete cascade
);
create table outify.items (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid() references outify.profiles(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 160), image_path text not null check(split_part(image_path,'/',1)=user_id::text),
 category text not null check(category in ('top','bottom','dress','outerwear','footwear','accessory','underwear','sportswear','other')),
 description text not null default '', primary_color text not null default '', brand text not null default '', size_label text not null default '', material text not null default '',
 seasons text[] not null default '{}' check(seasons <@ array['spring','summer','autumn','winter']::text[]),
 status text not null default 'active' check(status in ('active','archived')), archived_at timestamptz,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id), unique(image_path)
);
create table outify.item_locations (
 item_id bigint primary key, user_id uuid not null default auth.uid(), zone_id bigint not null, updated_at timestamptz not null default now(),
 foreign key(item_id,user_id) references outify.items(id,user_id) on delete cascade,
 foreign key(zone_id,user_id) references outify.zones(id,user_id) on delete cascade
);
create table outify.tags (
 id bigint generated always as identity primary key, user_id uuid not null default auth.uid() references outify.profiles(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 50), created_at timestamptz not null default now(), updated_at timestamptz not null default now(), unique(id,user_id)
);
create unique index tags_user_name on outify.tags(user_id,lower(name));
create table outify.item_tags (
 item_id bigint not null, tag_id bigint not null, user_id uuid not null default auth.uid(), primary key(item_id,tag_id),
 foreign key(item_id,user_id) references outify.items(id,user_id) on delete cascade,
 foreign key(tag_id,user_id) references outify.tags(id,user_id) on delete cascade
);
create index wardrobes_owner on outify.wardrobes(user_id);
create index zones_owner on outify.zones(user_id);
create index zones_parent on outify.zones(wardrobe_id,user_id);
create index items_owner on outify.items(user_id);
create index items_active on outify.items(user_id,updated_at desc) where status='active';
create index locations_owner on outify.item_locations(user_id);
create index locations_zone on outify.item_locations(zone_id,user_id);
create index item_tags_owner on outify.item_tags(user_id);
create index item_tags_tag on outify.item_tags(tag_id,user_id);

alter table outify.profiles enable row level security;
create policy owner on outify.profiles for all to authenticated using(id=(select auth.uid())) with check(id=(select auth.uid()));
do $block$
declare t text;
begin
 foreach t in array array['wardrobes','zones','items','item_locations','tags','item_tags'] loop
  execute format('alter table outify.%I enable row level security',t);
  execute format('create policy owner on outify.%I for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()))',t);
 end loop;
end $block$;
grant select,insert,update,delete on all tables in schema outify to authenticated;
grant usage,select on all sequences in schema outify to authenticated;
revoke delete on outify.profiles from authenticated;

create function outify_private.touch_updated_at() returns trigger language plpgsql set search_path='' as $$
begin new.updated_at=now(); return new; end $$;
do $block$
declare t text;
begin
 foreach t in array array['profiles','wardrobes','zones','items','item_locations','tags'] loop
  execute format('create trigger touch_updated_at before update on outify.%I for each row execute function outify_private.touch_updated_at()',t);
 end loop;
end $block$;

create function outify_private.sync_item_status() returns trigger language plpgsql set search_path='' as $$
begin
 if new.status='archived' then
  new.archived_at=coalesce(new.archived_at,now());
  delete from outify.item_locations where item_id=new.id;
 else new.archived_at=null;
 end if;
 return new;
end $$;
create trigger item_status before update on outify.items for each row execute function outify_private.sync_item_status();
create function outify_private.check_active_location() returns trigger language plpgsql set search_path='' as $$
declare state text;
begin
 select status into state from outify.items where id=new.item_id and user_id=new.user_id for update;
 if state is distinct from 'active' then raise exception 'Solo se pueden ubicar artículos activos'; end if;
 return new;
end $$;
create trigger active_location before insert or update on outify.item_locations for each row execute function outify_private.check_active_location();

create function outify.initialize_user_workspace() returns void language plpgsql security invoker set search_path='' as $$
declare uid uuid := auth.uid(); wid bigint; initialized timestamptz;
begin
 if uid is null then raise exception 'Se requiere una sesión'; end if;
 insert into outify.profiles(id,display_name,avatar_url) values(uid,coalesce(auth.jwt()->'user_metadata'->>'full_name',''),auth.jwt()->'user_metadata'->>'avatar_url') on conflict(id) do nothing;
 select initialized_at into initialized from outify.profiles where id=uid for update;
 if initialized is not null then return; end if;
 insert into outify.wardrobes(name,room) values('Mi armario','Dormitorio') returning id into wid;
 insert into outify.zones(wardrobe_id,name,type,position_x,position_y,width,height,color) values
 (wid,'Para colgar','rail',24,24,360,552,'#DEE7D8'),(wid,'Doblado y a mano','shelf',408,24,368,552,'#D9D6CF');
 update outify.profiles set initialized_at=now() where id=uid;
end $$;

create function outify.save_item(item_data jsonb, target_zone bigint default null, tag_names text[] default '{}') returns bigint language plpgsql security invoker set search_path='' as $$
declare iid bigint; tid bigint; tag_name text;
begin
 if item_data->>'id' is null then
  insert into outify.items(name,image_path,category) values(trim(item_data->>'name'),item_data->>'image_path',item_data->>'category') returning id into iid;
 else
  iid=(item_data->>'id')::bigint;
  perform 1 from outify.items where id=iid for update;
  if not found then raise exception 'Artículo no disponible'; end if;
 end if;
 update outify.items set name=trim(item_data->>'name'),image_path=item_data->>'image_path',category=item_data->>'category',
 description=coalesce(item_data->>'description',''),primary_color=coalesce(item_data->>'primary_color',''),brand=coalesce(item_data->>'brand',''),
 size_label=coalesce(item_data->>'size_label',''),material=coalesce(item_data->>'material',''),
 seasons=array(select jsonb_array_elements_text(coalesce(item_data->'seasons','[]'::jsonb))) where id=iid;
 delete from outify.item_locations where item_id=iid;
 if target_zone is not null then insert into outify.item_locations(item_id,zone_id) values(iid,target_zone); end if;
 delete from outify.item_tags where item_id=iid;
 foreach tag_name in array tag_names loop
  tag_name=trim(tag_name);
  if tag_name='' then continue; end if;
  insert into outify.tags(name) values(tag_name) on conflict(user_id,lower(name)) do update set name=excluded.name returning id into tid;
  insert into outify.item_tags(item_id,tag_id) values(iid,tid) on conflict do nothing;
 end loop;
 return iid;
end $$;

-- Cola persistente: el borrado de la ficha y el trabajo de limpieza son atómicos.
create table outify.image_cleanup (
 path text primary key, user_id uuid not null default auth.uid() references outify.profiles(id) on delete cascade,
 created_at timestamptz not null default now(), check(split_part(path,'/',1)=user_id::text)
);
alter table outify.image_cleanup enable row level security;
create policy owner on outify.image_cleanup for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()));
create index image_cleanup_owner on outify.image_cleanup(user_id);
grant select,insert,delete on outify.image_cleanup to authenticated;
create function outify.delete_archived_item(item bigint) returns void language plpgsql security invoker set search_path='' as $$
declare image text;
begin
 select image_path into image from outify.items where id=item and status='archived' for update;
 if not found then raise exception 'Solo se pueden eliminar artículos archivados'; end if;
 insert into outify.image_cleanup(path) values(image) on conflict do nothing;
 delete from outify.items where id=item;
end $$;
revoke delete on outify.items from authenticated;
-- El permiso de borrado se concentra en una función privada que valida dueño y estado.
alter function outify.delete_archived_item(bigint) set schema outify_private;
alter function outify_private.delete_archived_item(bigint) security definer;
create function outify.delete_archived_item(item bigint) returns void language sql security invoker set search_path='' as $$ select outify_private.delete_archived_item(item); $$;
-- La función privilegiada necesita filtro explícito porque su propietario omite RLS.
create or replace function outify_private.delete_archived_item(item bigint) returns void language plpgsql security definer set search_path='' as $$
declare image text; uid uuid:=auth.uid();
begin
 select image_path into image from outify.items where id=item and user_id=uid and status='archived' for update;
 if not found then raise exception 'Solo se pueden eliminar artículos archivados propios'; end if;
 insert into outify.image_cleanup(path,user_id) values(image,uid) on conflict do nothing;
 delete from outify.items where id=item and user_id=uid;
end $$;
grant usage on schema outify_private to authenticated;
revoke all on all functions in schema outify_private from public,anon,authenticated;
grant execute on function outify_private.delete_archived_item(bigint) to authenticated;
revoke all on all functions in schema outify from public,anon;
grant execute on all functions in schema outify to authenticated;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values('outify-item-images','outify-item-images',false,8388608,array['image/jpeg','image/png','image/webp']);
create policy outify_images_select on storage.objects for select to authenticated using(bucket_id='outify-item-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy outify_images_insert on storage.objects for insert to authenticated with check(bucket_id='outify-item-images' and (storage.foldername(name))[1]=(select auth.uid())::text);
create policy outify_images_delete on storage.objects for delete to authenticated using(bucket_id='outify-item-images' and (storage.foldername(name))[1]=(select auth.uid())::text);

create index locations_item_owner on outify.item_locations(item_id,user_id);
create index item_tags_item_owner on outify.item_tags(item_id,user_id);
-- Encola la imagen anterior en la misma transacción que cambia la ficha.
create function outify_private.track_item_image() returns trigger language plpgsql set search_path='' as $$
begin
 if tg_op='UPDATE' and old.image_path<>new.image_path then
  insert into outify.image_cleanup(path,user_id) values(old.image_path,old.user_id) on conflict do nothing;
 end if;
 delete from outify.image_cleanup where path=new.image_path and user_id=new.user_id;
 return new;
end $$;
create trigger track_item_image after insert or update of image_path on outify.items for each row execute function outify_private.track_item_image();
revoke all on function outify_private.track_item_image() from public,anon,authenticated;

alter table outify.image_cleanup add column process_after timestamptz not null default now();
