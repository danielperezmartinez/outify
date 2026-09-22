-- Restauración transaccional de zonas y ubicaciones del historial.
create or replace function outify.restore_zone_state(
 target_id bigint, target_wardrobe bigint, expected_state jsonb, restored_state jsonb,
 assigned_items bigint[]
) returns jsonb language plpgsql security invoker set search_path='' as $$
declare current_zone outify.zones; next_zone outify.zones; result jsonb;
begin
 if auth.uid() is null then raise exception 'Tu sesión ha caducado'; end if;
 perform 1 from outify.wardrobes where id=target_wardrobe for update;
 if not found then raise exception 'El armario ya no está disponible'; end if;
 select * into current_zone from outify.zones where id=target_id for update;
 if (case when current_zone.id is null then 'null'::jsonb else to_jsonb(current_zone)-'updated_at' end)
    is distinct from (case when expected_state is null or expected_state='null'::jsonb then 'null'::jsonb else expected_state-'updated_at' end)
 then raise exception 'La zona ha cambiado en otra sesión. Recarga antes de continuar.'; end if;
 if current_zone.id is not null and current_zone.wardrobe_id<>target_wardrobe then
   raise exception 'La zona no pertenece al armario';
 end if;
 if restored_state is null or restored_state='null'::jsonb then
   -- Rechaza una eliminación si las ubicaciones ya no coinciden con el snapshot.
   if (select coalesce(array_agg(item_id order by item_id),'{}'::bigint[]) from outify.item_locations where zone_id=target_id)
      is distinct from (select coalesce(array_agg(v order by v),'{}'::bigint[]) from unnest(assigned_items) v)
   then raise exception 'Las prendas de esta zona han cambiado. Recarga antes de continuar.'; end if;
   delete from outify.zones where id=target_id;
   return null;
 end if;
 next_zone=jsonb_populate_record(null::outify.zones,restored_state);
 if next_zone.id is distinct from target_id or next_zone.wardrobe_id is distinct from target_wardrobe
    or next_zone.user_id is distinct from auth.uid() then raise exception 'Snapshot no válido'; end if;
 if current_zone.id is null then
   insert into outify.zones(id,user_id,wardrobe_id,name,type,color,position_x,position_y,width,height,z_index,created_at)
   overriding system value values(next_zone.id,auth.uid(),target_wardrobe,next_zone.name,next_zone.type,next_zone.color,
    next_zone.position_x,next_zone.position_y,next_zone.width,next_zone.height,next_zone.z_index,next_zone.created_at)
   returning to_jsonb(zones.*) into result;
   -- No sustituye ubicaciones realizadas después de borrar la zona ni recupera artículos archivados.
   perform 1 from outify.items where id=any(assigned_items) order by id for update;
   if (select count(*) from outify.items where id=any(assigned_items) and status='active')<>cardinality(assigned_items)
      or exists(select 1 from outify.item_locations where item_id=any(assigned_items))
   then raise exception 'Alguna prenda ha cambiado. No se ha restaurado la zona; recarga antes de continuar.'; end if;
   insert into outify.item_locations(item_id,zone_id) select v,target_id from unnest(assigned_items) v;
 else
   update outify.zones set name=next_zone.name,type=next_zone.type,color=next_zone.color,
    position_x=next_zone.position_x,position_y=next_zone.position_y,width=next_zone.width,height=next_zone.height,z_index=next_zone.z_index
   where id=target_id returning to_jsonb(zones.*) into result;
 end if;
 return result;
end $$;
revoke all on function outify.restore_zone_state(bigint,bigint,jsonb,jsonb,bigint[]) from public,anon;
grant execute on function outify.restore_zone_state(bigint,bigint,jsonb,jsonb,bigint[]) to authenticated;

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
