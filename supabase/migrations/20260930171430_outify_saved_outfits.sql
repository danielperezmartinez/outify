-- Outfits: composición ordenada y referencias de artículos eliminados.
create table outify.outfits (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid() references outify.profiles(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 160),
 notes text not null default '', is_favorite boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id)
);
create table outify.outfit_items (
 id bigint generated always as identity primary key,
 outfit_id bigint not null, user_id uuid not null default auth.uid(),
 item_id bigint, deleted_name text,
 position integer not null check(position >= 0),
 foreign key(outfit_id,user_id) references outify.outfits(id,user_id) on delete cascade,
 foreign key(item_id,user_id) references outify.items(id,user_id),
 unique(outfit_id,item_id),
 unique(outfit_id,position) deferrable initially deferred,
 check ((item_id is not null and deleted_name is null) or (item_id is null and deleted_name is not null))
);
create index outfits_owner_updated on outify.outfits(user_id,updated_at desc,id);
create index outfit_items_owner on outify.outfit_items(user_id);
create index outfit_items_item on outify.outfit_items(item_id,user_id);
do $block$
declare t text;
begin
 foreach t in array array['outfits','outfit_items'] loop
  execute format('alter table outify.%I enable row level security',t);
  execute format('create policy owner on outify.%I for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()))',t);
  execute format('create policy workspace_access on outify.%I as restrictive for all to authenticated using ((select outify_private.workspace_active())) with check ((select outify_private.workspace_active()))',t);
  execute format('create trigger guard_workspace_write before insert or update or delete on outify.%I for each row execute function outify_private.guard_workspace_write()',t);
 end loop;
end $block$;
revoke all on outify.outfits,outify.outfit_items from public,anon,authenticated;
grant select on outify.outfits,outify.outfit_items to authenticated;
grant delete on outify.outfits to authenticated;
grant update(is_favorite) on outify.outfits to authenticated;
create trigger set_updated_at before update on outify.outfits for each row execute function outify_private.touch_updated_at();

-- El aviso conserva únicamente el nombre, nunca la foto ni su ruta privada.
create function outify_private.keep_deleted_outfit_item() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 update outify.outfit_items set item_id=null,deleted_name=old.name
 where item_id=old.id and user_id=old.user_id;
 return old;
end $$;
revoke all on function outify_private.keep_deleted_outfit_item() from public,anon,authenticated;
create trigger keep_deleted_outfit_item before delete on outify.items
 for each row execute function outify_private.keep_deleted_outfit_item();

-- Cada entrada lleva su id existente O el item_id que se desea añadir.
-- Los nombres de referencias eliminadas nunca se aceptan del cliente.
create function outify_private.save_outfit(outfit_id bigint, outfit_name text, outfit_notes text, entries jsonb)
returns bigint language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); oid bigint:=nullif(outfit_id,0); entry jsonb; eid bigint; iid bigint;
 retained bigint[]:='{}'; added bigint[]:='{}'; position_index integer:=0; state text;
begin
 select status into state from outify_private.account_lifecycle where user_id=uid for share;
 if state is distinct from 'active' or not outify_private.workspace_active() then
  raise exception 'Tu espacio no está activo';
 end if;
 if outfit_name is null or length(trim(outfit_name)) not between 1 and 160 then
  raise exception 'Escribe un nombre de entre 1 y 160 caracteres.';
 end if;
 if jsonb_typeof(entries) is distinct from 'array' then raise exception 'Revisa las prendas seleccionadas.'; end if;
 if jsonb_array_length(entries)=0 then raise exception 'Añade al menos una prenda al outfit.'; end if;

 -- Bloquear primero los artículos serializa archivado/borrado con el guardado.
 perform i.id from outify.items i where i.user_id=uid and (
  i.id in (select (e->>'item_id')::bigint from jsonb_array_elements(entries) e)
  or i.id in (select oi.item_id from outify.outfit_items oi where oi.outfit_id=oid and oi.user_id=uid)
 ) order by i.id for update;
 if oid is not null then
  perform 1 from outify.outfits o where o.id=oid and o.user_id=uid for update;
  if not found then raise exception 'Este outfit no está disponible.'; end if;
 else
  insert into outify.outfits(user_id,name,notes) values(uid,trim(outfit_name),coalesce(outfit_notes,'')) returning id into oid;
 end if;
 for entry in select value from jsonb_array_elements(entries) loop
  eid:=(entry->>'id')::bigint; iid:=(entry->>'item_id')::bigint;
  if eid is not null then
   if iid is not null or eid=any(retained) then raise exception 'Revisa las prendas seleccionadas.'; end if;
   perform 1 from outify.outfit_items oi where oi.id=eid and oi.outfit_id=oid and oi.user_id=uid;
   if not found then raise exception 'La composición ha cambiado. Vuelve a abrir la ficha.'; end if;
   retained:=array_append(retained,eid);
  else
   if iid is null or iid=any(added) then raise exception 'No repitas prendas en el outfit.'; end if;
   perform 1 from outify.items i where i.id=iid and i.user_id=uid and i.status='active';
   if not found then raise exception 'Una prenda seleccionada ya no está activa. Revisa la selección.'; end if;
   added:=array_append(added,iid);
  end if;
 end loop;
 -- Permite quitar y volver a añadir una prenda activa sin cambiar otras entradas.
 delete from outify.outfit_items oi where oi.outfit_id=oid and oi.user_id=uid and not (oi.id=any(retained));
 for entry in select value from jsonb_array_elements(entries) loop
  eid:=(entry->>'id')::bigint; iid:=(entry->>'item_id')::bigint;
  if eid is not null then
   update outify.outfit_items set position=position_index where id=eid and user_id=uid;
  else
   if exists(select 1 from outify.outfit_items oi where oi.outfit_id=oid and oi.item_id=iid) then
    raise exception 'No repitas prendas en el outfit.';
   end if;
   insert into outify.outfit_items(outfit_id,user_id,item_id,position) values(oid,uid,iid,position_index);
  end if;
  position_index:=position_index+1;
 end loop;
 update outify.outfits set name=trim(outfit_name),notes=coalesce(outfit_notes,'') where id=oid and user_id=uid;
 return oid;
end $$;
create function outify.save_outfit(outfit_id bigint, outfit_name text, outfit_notes text, entries jsonb)
returns bigint language sql security invoker set search_path='' as $$
 select outify_private.save_outfit(outfit_id,outfit_name,outfit_notes,entries);
$$;
revoke all on function outify.save_outfit(bigint,text,text,jsonb),outify_private.save_outfit(bigint,text,text,jsonb) from public,anon,authenticated;
grant execute on function outify.save_outfit(bigint,text,text,jsonb),outify_private.save_outfit(bigint,text,text,jsonb) to authenticated;

-- Outfits: composición ordenada y referencias de artículos eliminados.
create table outify_dev.outfits (
 id bigint generated always as identity primary key,
 user_id uuid not null default auth.uid() references outify_dev.profiles(id) on delete cascade,
 name text not null check(length(trim(name)) between 1 and 160),
 notes text not null default '', is_favorite boolean not null default false,
 created_at timestamptz not null default now(), updated_at timestamptz not null default now(),
 unique(id,user_id)
);
create table outify_dev.outfit_items (
 id bigint generated always as identity primary key,
 outfit_id bigint not null, user_id uuid not null default auth.uid(),
 item_id bigint, deleted_name text,
 position integer not null check(position >= 0),
 foreign key(outfit_id,user_id) references outify_dev.outfits(id,user_id) on delete cascade,
 foreign key(item_id,user_id) references outify_dev.items(id,user_id),
 unique(outfit_id,item_id),
 unique(outfit_id,position) deferrable initially deferred,
 check ((item_id is not null and deleted_name is null) or (item_id is null and deleted_name is not null))
);
create index outfits_owner_updated on outify_dev.outfits(user_id,updated_at desc,id);
create index outfit_items_owner on outify_dev.outfit_items(user_id);
create index outfit_items_item on outify_dev.outfit_items(item_id,user_id);
do $block$
declare t text;
begin
 foreach t in array array['outfits','outfit_items'] loop
  execute format('alter table outify_dev.%I enable row level security',t);
  execute format('create policy owner on outify_dev.%I for all to authenticated using(user_id=(select auth.uid())) with check(user_id=(select auth.uid()))',t);
  execute format('create policy workspace_access on outify_dev.%I as restrictive for all to authenticated using ((select outify_dev_private.workspace_active())) with check ((select outify_dev_private.workspace_active()))',t);
  execute format('create trigger guard_workspace_write before insert or update or delete on outify_dev.%I for each row execute function outify_dev_private.guard_workspace_write()',t);
 end loop;
end $block$;
revoke all on outify_dev.outfits,outify_dev.outfit_items from public,anon,authenticated;
grant select on outify_dev.outfits,outify_dev.outfit_items to authenticated;
grant delete on outify_dev.outfits to authenticated;
grant update(is_favorite) on outify_dev.outfits to authenticated;
create trigger set_updated_at before update on outify_dev.outfits for each row execute function outify_dev_private.touch_updated_at();

-- El aviso conserva únicamente el nombre, nunca la foto ni su ruta privada.
create function outify_dev_private.keep_deleted_outfit_item() returns trigger
language plpgsql security definer set search_path='' as $$
begin
 update outify_dev.outfit_items set item_id=null,deleted_name=old.name
 where item_id=old.id and user_id=old.user_id;
 return old;
end $$;
revoke all on function outify_dev_private.keep_deleted_outfit_item() from public,anon,authenticated;
create trigger keep_deleted_outfit_item before delete on outify_dev.items
 for each row execute function outify_dev_private.keep_deleted_outfit_item();

-- Cada entrada lleva su id existente O el item_id que se desea añadir.
-- Los nombres de referencias eliminadas nunca se aceptan del cliente.
create function outify_dev_private.save_outfit(outfit_id bigint, outfit_name text, outfit_notes text, entries jsonb)
returns bigint language plpgsql security definer set search_path='' as $$
declare uid uuid:=auth.uid(); oid bigint:=nullif(outfit_id,0); entry jsonb; eid bigint; iid bigint;
 retained bigint[]:='{}'; added bigint[]:='{}'; position_index integer:=0; state text;
begin
 select status into state from outify_dev_private.account_lifecycle where user_id=uid for share;
 if state is distinct from 'active' or not outify_dev_private.workspace_active() then
  raise exception 'Tu espacio no está activo';
 end if;
 if outfit_name is null or length(trim(outfit_name)) not between 1 and 160 then
  raise exception 'Escribe un nombre de entre 1 y 160 caracteres.';
 end if;
 if jsonb_typeof(entries) is distinct from 'array' then raise exception 'Revisa las prendas seleccionadas.'; end if;
 if jsonb_array_length(entries)=0 then raise exception 'Añade al menos una prenda al outfit.'; end if;

 -- Bloquear primero los artículos serializa archivado/borrado con el guardado.
 perform i.id from outify_dev.items i where i.user_id=uid and (
  i.id in (select (e->>'item_id')::bigint from jsonb_array_elements(entries) e)
  or i.id in (select oi.item_id from outify_dev.outfit_items oi where oi.outfit_id=oid and oi.user_id=uid)
 ) order by i.id for update;
 if oid is not null then
  perform 1 from outify_dev.outfits o where o.id=oid and o.user_id=uid for update;
  if not found then raise exception 'Este outfit no está disponible.'; end if;
 else
  insert into outify_dev.outfits(user_id,name,notes) values(uid,trim(outfit_name),coalesce(outfit_notes,'')) returning id into oid;
 end if;
 for entry in select value from jsonb_array_elements(entries) loop
  eid:=(entry->>'id')::bigint; iid:=(entry->>'item_id')::bigint;
  if eid is not null then
   if iid is not null or eid=any(retained) then raise exception 'Revisa las prendas seleccionadas.'; end if;
   perform 1 from outify_dev.outfit_items oi where oi.id=eid and oi.outfit_id=oid and oi.user_id=uid;
   if not found then raise exception 'La composición ha cambiado. Vuelve a abrir la ficha.'; end if;
   retained:=array_append(retained,eid);
  else
   if iid is null or iid=any(added) then raise exception 'No repitas prendas en el outfit.'; end if;
   perform 1 from outify_dev.items i where i.id=iid and i.user_id=uid and i.status='active';
   if not found then raise exception 'Una prenda seleccionada ya no está activa. Revisa la selección.'; end if;
   added:=array_append(added,iid);
  end if;
 end loop;
 -- Permite quitar y volver a añadir una prenda activa sin cambiar otras entradas.
 delete from outify_dev.outfit_items oi where oi.outfit_id=oid and oi.user_id=uid and not (oi.id=any(retained));
 for entry in select value from jsonb_array_elements(entries) loop
  eid:=(entry->>'id')::bigint; iid:=(entry->>'item_id')::bigint;
  if eid is not null then
   update outify_dev.outfit_items set position=position_index where id=eid and user_id=uid;
  else
   if exists(select 1 from outify_dev.outfit_items oi where oi.outfit_id=oid and oi.item_id=iid) then
    raise exception 'No repitas prendas en el outfit.';
   end if;
   insert into outify_dev.outfit_items(outfit_id,user_id,item_id,position) values(oid,uid,iid,position_index);
  end if;
  position_index:=position_index+1;
 end loop;
 update outify_dev.outfits set name=trim(outfit_name),notes=coalesce(outfit_notes,'') where id=oid and user_id=uid;
 return oid;
end $$;
create function outify_dev.save_outfit(outfit_id bigint, outfit_name text, outfit_notes text, entries jsonb)
returns bigint language sql security invoker set search_path='' as $$
 select outify_dev_private.save_outfit(outfit_id,outfit_name,outfit_notes,entries);
$$;
revoke all on function outify_dev.save_outfit(bigint,text,text,jsonb),outify_dev_private.save_outfit(bigint,text,text,jsonb) from public,anon,authenticated;
grant execute on function outify_dev.save_outfit(bigint,text,text,jsonb),outify_dev_private.save_outfit(bigint,text,text,jsonb) to authenticated;
