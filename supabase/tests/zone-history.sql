-- Ejecutar después de cargar la migración, en desarrollo; rollback de todos los datos.
begin;
insert into auth.users(id,email) values
 ('22222222-0000-4000-8000-000000000001','outify-history-a@example.invalid'),
 ('22222222-0000-4000-8000-000000000002','outify-history-b@example.invalid');
insert into auth.sessions(id,user_id,created_at,updated_at) select id,id,now(),now() from auth.users where id in ('22222222-0000-4000-8000-000000000001','22222222-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"22222222-0000-4000-8000-000000000001","session_id":"22222222-0000-4000-8000-000000000001","role":"authenticated"}',true);
select outify_dev.activate_workspace(true);
select outify_dev.initialize_user_workspace();
do $$
declare z outify_dev.zones; saved jsonb; iid bigint; other_zone bigint;
begin
 select * into z from outify_dev.zones order by id limit 1;
 select id into other_zone from outify_dev.zones where id<>z.id limit 1;
 iid=outify_dev.save_item('{"name":"Camisa historial","category":"top","image_path":"22222222-0000-4000-8000-000000000001/test.png"}',z.id,array[]::text[]);
 perform outify_dev.restore_zone_state(z.id,z.wardrobe_id,to_jsonb(z),null,array[iid]);
 if exists(select 1 from outify_dev.zones where id=z.id) or exists(select 1 from outify_dev.item_locations where item_id=iid) then raise exception 'Borrado incompleto'; end if;
 if not exists(select 1 from outify_dev.items where id=iid) then raise exception 'Pérdida de prenda'; end if;
 saved=outify_dev.restore_zone_state(z.id,z.wardrobe_id,null,to_jsonb(z),array[iid]);
 if (saved-'updated_at')<>(to_jsonb(z)-'updated_at') then raise exception 'Snapshot incompleto'; end if;
 if not exists(select 1 from outify_dev.item_locations where item_id=iid and zone_id=z.id) then raise exception 'Ubicación no restaurada'; end if;
 perform outify_dev.restore_zone_state(z.id,z.wardrobe_id,saved,saved||'{"position_x":64}'::jsonb,array[]::bigint[]);
 if (select position_x from outify_dev.zones where id=z.id)<>64 then raise exception 'Geometría no restaurada'; end if;
 begin
  perform outify_dev.restore_zone_state(z.id,z.wardrobe_id,saved,null,array[iid]);
  raise exception 'TEST: aceptó snapshot obsoleto';
 exception when raise_exception then if sqlerrm like 'TEST:%' then raise; end if; end;
 select to_jsonb(zone.*) into saved from outify_dev.zones zone where id=z.id;
 perform outify_dev.restore_zone_state(z.id,z.wardrobe_id,saved,null,array[iid]);
 insert into outify_dev.item_locations(item_id,zone_id) values(iid,other_zone);
 begin
  perform outify_dev.restore_zone_state(z.id,z.wardrobe_id,null,saved,array[iid]);
  raise exception 'TEST: sobrescribió ubicación nueva';
 exception when raise_exception then if sqlerrm like 'TEST:%' then raise; end if; end;
 if exists(select 1 from outify_dev.zones where id=z.id) then raise exception 'Restauración parcial tras fallo'; end if;
 if (select zone_id from outify_dev.item_locations where item_id=iid)<>other_zone then raise exception 'Ubicación ajena al comando alterada'; end if;
 perform set_config('request.jwt.claims','{"sub":"22222222-0000-4000-8000-000000000002","session_id":"22222222-0000-4000-8000-000000000002","role":"authenticated"}',true);
 begin
  perform outify_dev.restore_zone_state(z.id,z.wardrobe_id,null,saved,array[]::bigint[]);
  raise exception 'TEST: permitió acceso a otro propietario';
 exception when raise_exception then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
rollback;
