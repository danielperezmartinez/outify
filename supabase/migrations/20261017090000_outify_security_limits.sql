-- Límites de seguridad y coste (outify). Solo afecta a objetos y al bucket outify-item-images.
alter table outify.profiles
 add constraint profiles_display_name_length check (length(display_name) <= 80),
 add constraint profiles_avatar_url_length check (avatar_url is null or length(avatar_url) <= 2048);
alter table outify.wardrobes
 add constraint wardrobes_room_length check (length(room) <= 80),
 add constraint wardrobes_description_length check (length(description) <= 1000);
alter table outify.items
 add constraint items_description_length check (length(description) <= 1000),
 add constraint items_short_text_length check (length(primary_color) <= 80 and length(brand) <= 80 and length(size_label) <= 80 and length(material) <= 80);
alter table outify.outfits add constraint outfits_notes_length check (length(notes) <= 1000);
alter table outify.outfit_items add constraint outfit_items_deleted_name_length check (deleted_name is null or length(deleted_name) <= 160);
alter table outify.image_cleanup add constraint image_cleanup_path_length check (length(path) <= 200);

-- Los datos de OAuth se ajustan al alta para no bloquearla.
create function outify_private.fit_profile() returns trigger language plpgsql set search_path='' as $$
begin
 new.display_name=left(new.display_name,80);
 if length(new.avatar_url)>2048 then new.avatar_url=null; end if;
 return new;
end $$;
create trigger fit_profile before insert on outify.profiles for each row execute function outify_private.fit_profile();

-- Tope de filas: tg_argv = columna de ámbito, máximo y nombre visible.
create function outify_private.enforce_row_limit() returns trigger language plpgsql set search_path='' as $$
declare scope_column text := tg_argv[0]; maximum integer := tg_argv[1]::integer; scope_value text; total bigint;
begin
 scope_value=to_jsonb(new)->>scope_column;
 perform pg_advisory_xact_lock(hashtext(tg_table_schema||'.'||tg_table_name||':'||scope_value));
 execute format('select count(*) from %I.%I where %I = %L',tg_table_schema,tg_table_name,scope_column,scope_value) into total;
 if total>=maximum then raise exception 'Has alcanzado el máximo de % %.',maximum,tg_argv[2]; end if;
 return new;
end $$;
create trigger row_limit before insert on outify.wardrobes for each row execute function outify_private.enforce_row_limit('user_id','20','armarios');
create trigger row_limit before insert on outify.zones for each row execute function outify_private.enforce_row_limit('user_id','200','zonas');
create trigger row_limit before insert on outify.items for each row execute function outify_private.enforce_row_limit('user_id','500','prendas');
create trigger row_limit before insert on outify.tags for each row execute function outify_private.enforce_row_limit('user_id','200','etiquetas');
create trigger row_limit before insert on outify.item_tags for each row execute function outify_private.enforce_row_limit('item_id','20','etiquetas por prenda');
create trigger row_limit before insert on outify.outfits for each row execute function outify_private.enforce_row_limit('user_id','300','outfits');
create trigger row_limit before insert on outify.outfit_items for each row execute function outify_private.enforce_row_limit('outfit_id','20','prendas por outfit');
create trigger row_limit before insert on outify.image_cleanup for each row execute function outify_private.enforce_row_limit('user_id','1000','fotos pendientes de limpieza');

-- Cuota de fotos por usuario y del bucket completo. Si Storage aún no conoce el
-- tamaño al insertar, el exceso máximo es un fichero (file_size_limit, 8 MB).
create function outify_private.guard_image_quota() returns trigger
language plpgsql security definer set search_path='' as $$
declare folder text; new_size bigint; used_objects bigint; used_bytes bigint; bucket_bytes bigint;
begin
 if new.bucket_id<>'outify-item-images' then return new; end if;
 folder=split_part(new.name,'/',1);
 new_size=coalesce((new.metadata->>'size')::bigint,0);
 perform pg_advisory_xact_lock(hashtext('outify-item-images'));
 select count(*),coalesce(sum((metadata->>'size')::bigint),0) into used_objects,used_bytes
 from storage.objects where bucket_id='outify-item-images' and name like folder||'/%' and id is distinct from new.id;
 if used_objects>=500 or used_bytes+new_size>50*1024*1024 then
  raise exception 'Has alcanzado el espacio máximo para fotos: 50 MB o 500 imágenes.';
 end if;
 select coalesce(sum((metadata->>'size')::bigint),0) into bucket_bytes
 from storage.objects where bucket_id='outify-item-images' and id is distinct from new.id;
 if bucket_bytes+new_size>250*1024*1024 then
  raise exception 'El almacenamiento de fotos de Outify está lleno. Inténtalo más tarde.';
 end if;
 return new;
end $$;
create trigger outify_guard_image_quota before insert on storage.objects
for each row execute function outify_private.guard_image_quota();
revoke all on function outify_private.fit_profile(),outify_private.enforce_row_limit(),outify_private.guard_image_quota() from public,anon,authenticated;

-- Excepción escrita: las políticas restrictivas de storage.objects se aplican a anon.
comment on function outify_private.workspace_active() is 'excepcion: Excepción - outify_private.workspace_active()';

-- Límites de seguridad y coste (outify_dev). Solo afecta a objetos y al bucket outify-dev-item-images.
alter table outify_dev.profiles
 add constraint profiles_display_name_length check (length(display_name) <= 80),
 add constraint profiles_avatar_url_length check (avatar_url is null or length(avatar_url) <= 2048);
alter table outify_dev.wardrobes
 add constraint wardrobes_room_length check (length(room) <= 80),
 add constraint wardrobes_description_length check (length(description) <= 1000);
alter table outify_dev.items
 add constraint items_description_length check (length(description) <= 1000),
 add constraint items_short_text_length check (length(primary_color) <= 80 and length(brand) <= 80 and length(size_label) <= 80 and length(material) <= 80);
alter table outify_dev.outfits add constraint outfits_notes_length check (length(notes) <= 1000);
alter table outify_dev.outfit_items add constraint outfit_items_deleted_name_length check (deleted_name is null or length(deleted_name) <= 160);
alter table outify_dev.image_cleanup add constraint image_cleanup_path_length check (length(path) <= 200);

-- Los datos de OAuth se ajustan al alta para no bloquearla.
create function outify_dev_private.fit_profile() returns trigger language plpgsql set search_path='' as $$
begin
 new.display_name=left(new.display_name,80);
 if length(new.avatar_url)>2048 then new.avatar_url=null; end if;
 return new;
end $$;
create trigger fit_profile before insert on outify_dev.profiles for each row execute function outify_dev_private.fit_profile();

-- Tope de filas: tg_argv = columna de ámbito, máximo y nombre visible.
create function outify_dev_private.enforce_row_limit() returns trigger language plpgsql set search_path='' as $$
declare scope_column text := tg_argv[0]; maximum integer := tg_argv[1]::integer; scope_value text; total bigint;
begin
 scope_value=to_jsonb(new)->>scope_column;
 perform pg_advisory_xact_lock(hashtext(tg_table_schema||'.'||tg_table_name||':'||scope_value));
 execute format('select count(*) from %I.%I where %I = %L',tg_table_schema,tg_table_name,scope_column,scope_value) into total;
 if total>=maximum then raise exception 'Has alcanzado el máximo de % %.',maximum,tg_argv[2]; end if;
 return new;
end $$;
create trigger row_limit before insert on outify_dev.wardrobes for each row execute function outify_dev_private.enforce_row_limit('user_id','20','armarios');
create trigger row_limit before insert on outify_dev.zones for each row execute function outify_dev_private.enforce_row_limit('user_id','200','zonas');
create trigger row_limit before insert on outify_dev.items for each row execute function outify_dev_private.enforce_row_limit('user_id','500','prendas');
create trigger row_limit before insert on outify_dev.tags for each row execute function outify_dev_private.enforce_row_limit('user_id','200','etiquetas');
create trigger row_limit before insert on outify_dev.item_tags for each row execute function outify_dev_private.enforce_row_limit('item_id','20','etiquetas por prenda');
create trigger row_limit before insert on outify_dev.outfits for each row execute function outify_dev_private.enforce_row_limit('user_id','300','outfits');
create trigger row_limit before insert on outify_dev.outfit_items for each row execute function outify_dev_private.enforce_row_limit('outfit_id','20','prendas por outfit');
create trigger row_limit before insert on outify_dev.image_cleanup for each row execute function outify_dev_private.enforce_row_limit('user_id','1000','fotos pendientes de limpieza');

-- Cuota de fotos por usuario y del bucket completo. Si Storage aún no conoce el
-- tamaño al insertar, el exceso máximo es un fichero (file_size_limit, 8 MB).
create function outify_dev_private.guard_image_quota() returns trigger
language plpgsql security definer set search_path='' as $$
declare folder text; new_size bigint; used_objects bigint; used_bytes bigint; bucket_bytes bigint;
begin
 if new.bucket_id<>'outify-dev-item-images' then return new; end if;
 folder=split_part(new.name,'/',1);
 new_size=coalesce((new.metadata->>'size')::bigint,0);
 perform pg_advisory_xact_lock(hashtext('outify-dev-item-images'));
 select count(*),coalesce(sum((metadata->>'size')::bigint),0) into used_objects,used_bytes
 from storage.objects where bucket_id='outify-dev-item-images' and name like folder||'/%' and id is distinct from new.id;
 if used_objects>=500 or used_bytes+new_size>50*1024*1024 then
  raise exception 'Has alcanzado el espacio máximo para fotos: 50 MB o 500 imágenes.';
 end if;
 select coalesce(sum((metadata->>'size')::bigint),0) into bucket_bytes
 from storage.objects where bucket_id='outify-dev-item-images' and id is distinct from new.id;
 if bucket_bytes+new_size>250*1024*1024 then
  raise exception 'El almacenamiento de fotos de Outify está lleno. Inténtalo más tarde.';
 end if;
 return new;
end $$;
create trigger outify_dev_guard_image_quota before insert on storage.objects
for each row execute function outify_dev_private.guard_image_quota();
revoke all on function outify_dev_private.fit_profile(),outify_dev_private.enforce_row_limit(),outify_dev_private.guard_image_quota() from public,anon,authenticated;

-- Excepción escrita: las políticas restrictivas de storage.objects se aplican a anon.
comment on function outify_dev_private.workspace_active() is 'excepcion: Excepción - outify_private.workspace_active()';
