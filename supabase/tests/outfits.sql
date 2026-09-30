-- Datos sintéticos y rollback: ejecutar en una base local con las migraciones.
begin;
insert into auth.users(id,email) values
 ('33333333-0000-4000-8000-000000000001','outfits-a@example.invalid'),
 ('33333333-0000-4000-8000-000000000002','outfits-b@example.invalid');
insert into auth.sessions(id,user_id,created_at,updated_at)
select id,id,now(),now() from auth.users where id in
 ('33333333-0000-4000-8000-000000000001','33333333-0000-4000-8000-000000000002');
set local role authenticated;
select set_config('request.jwt.claims','{"sub":"33333333-0000-4000-8000-000000000001","session_id":"33333333-0000-4000-8000-000000000001","role":"authenticated"}',true);
select outify_dev.activate_workspace(true);
select outify_dev.save_item('{"name":"Camisa","category":"top","image_path":"33333333-0000-4000-8000-000000000001/shirt.png"}');
select outify_dev.save_item('{"name":"Pantalón","category":"bottom","image_path":"33333333-0000-4000-8000-000000000001/pants.png"}');
do $$
declare oid bigint; other_oid bigint; shirt bigint; pants bigint; first_entry bigint; second_entry bigint;
begin
 select id into shirt from outify_dev.items where name='Camisa';
 select id into pants from outify_dev.items where name='Pantalón';
 oid:=outify_dev.save_outfit(0,'  Mi outfit  ','Notas',jsonb_build_array(jsonb_build_object('item_id',shirt),jsonb_build_object('item_id',pants)));
 other_oid:=outify_dev.save_outfit(0,'Otro outfit','',jsonb_build_array(jsonb_build_object('item_id',shirt)));
 if (select name from outify_dev.outfits where id=oid)<>'Mi outfit' then raise exception 'Nombre sin normalizar'; end if;
 select id into first_entry from outify_dev.outfit_items where outfit_id=oid and item_id=shirt;
 select id into second_entry from outify_dev.outfit_items where outfit_id=oid and item_id=pants;
 perform outify_dev.save_outfit(oid,'Mi outfit','Nuevas notas',jsonb_build_array(jsonb_build_object('id',second_entry),jsonb_build_object('id',first_entry)));
 if (select position from outify_dev.outfit_items where id=second_entry)<>0 then raise exception 'Orden incorrecto'; end if;
 update outify_dev.outfits set is_favorite=true where id=oid;
 if not (select is_favorite from outify_dev.outfits where id=oid) then raise exception 'Favorito perdido'; end if;
 begin
  perform outify_dev.save_outfit(oid,'Cambio inválido','',jsonb_build_array(jsonb_build_object('id',first_entry),jsonb_build_object('item_id',shirt)));
  raise exception 'ERROR_TEST: duplicado aceptado';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
 if (select notes from outify_dev.outfits where id=oid)<>'Nuevas notas' or (select count(*) from outify_dev.outfit_items where outfit_id=oid)<>2 then raise exception 'Guardado parcial'; end if;
 begin
  perform outify_dev.save_outfit(0,'Vacío','','[]');
  raise exception 'ERROR_TEST: vacío aceptado';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
 begin
  perform outify_dev.save_outfit(0,'   ','',jsonb_build_array(jsonb_build_object('item_id',shirt)));
  raise exception 'ERROR_TEST: nombre vacío aceptado';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
 update outify_dev.items set status='archived' where id=shirt;
 perform outify_dev.save_outfit(oid,'Mi outfit','Archivado conservado',jsonb_build_array(jsonb_build_object('id',first_entry),jsonb_build_object('id',second_entry)));
 begin
  perform outify_dev.save_outfit(0,'Archivado nuevo','',jsonb_build_array(jsonb_build_object('item_id',shirt)));
  raise exception 'ERROR_TEST: archivado nuevo aceptado';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
 update outify_dev.items set status='active' where id=shirt;
 if not exists(select 1 from outify_dev.outfit_items oi join outify_dev.items i on i.id=oi.item_id where oi.id=first_entry and i.status='active') then raise exception 'Restauración perdida'; end if;
 update outify_dev.items set status='archived',name='Camisa renombrada' where id=shirt;
 perform outify_dev.delete_archived_item(shirt);
 if (select count(*) from outify_dev.outfit_items where item_id is null and deleted_name='Camisa renombrada')<>2 then raise exception 'Borrado perdió referencias'; end if;
 if not exists(select 1 from outify_dev.image_cleanup where path like '%/shirt.png') then raise exception 'Foto sin limpieza'; end if;
 perform outify_dev.save_outfit(other_oid,'Sin prendas disponibles','', (select jsonb_agg(jsonb_build_object('id',id)) from outify_dev.outfit_items where outfit_id=other_oid));
 begin
  perform outify_dev.save_outfit(0,'Referencia falsa','',jsonb_build_array(jsonb_build_object('id',first_entry)));
  raise exception 'ERROR_TEST: referencia ajena al outfit aceptada';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
 delete from outify_dev.outfits where id=other_oid;
 if not exists(select 1 from outify_dev.items where id=pants) then raise exception 'Eliminar outfit borró artículo'; end if;
 begin
  insert into outify_dev.outfits(name) values('Escritura directa');
  raise exception 'ERROR_TEST: escritura directa aceptada';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claims','{"sub":"33333333-0000-4000-8000-000000000002","session_id":"33333333-0000-4000-8000-000000000002","role":"authenticated"}',true);
select outify_dev.activate_workspace(true);
do $$ begin
 if exists(select 1 from outify_dev.outfits) or exists(select 1 from outify_dev.outfit_items) then raise exception 'Fuga entre cuentas'; end if;
end $$;
-- Un definer tampoco debe admitir identificadores del otro propietario.
reset role;
select set_config('outfit_test.foreign_outfit',(select min(id)::text from outify_dev.outfits where user_id='33333333-0000-4000-8000-000000000001'),true);
select set_config('outfit_test.foreign_item',(select min(id)::text from outify_dev.items where user_id='33333333-0000-4000-8000-000000000001'),true);
set local role authenticated;
do $$ begin
 begin
  perform outify_dev.save_outfit(0,'Robo','',jsonb_build_array(jsonb_build_object('item_id',current_setting('outfit_test.foreign_item')::bigint)));
  raise exception 'ERROR_TEST: artículo ajeno aceptado';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
 begin
  perform outify_dev.save_outfit(current_setting('outfit_test.foreign_outfit')::bigint,'Robo','',jsonb_build_array(jsonb_build_object('item_id',current_setting('outfit_test.foreign_item')::bigint)));
  raise exception 'ERROR_TEST: outfit ajeno aceptado';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
end $$;
select set_config('request.jwt.claims','{"sub":"33333333-0000-4000-8000-000000000001","session_id":"33333333-0000-4000-8000-000000000001","role":"authenticated"}',true);
select outify_dev.request_account_deletion();
do $$ begin
 if exists(select 1 from outify_dev.outfits) then raise exception 'Acceso tras baja'; end if;
 begin
  perform outify_dev.save_outfit(0,'Tras baja','',jsonb_build_array(jsonb_build_object('item_id',1)));
  raise exception 'ERROR_TEST: escritura tras baja aceptada';
 exception when raise_exception then if sqlerrm like 'ERROR_TEST:%' then raise; end if; end;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
delete from outify_dev.profiles where id='33333333-0000-4000-8000-000000000001';
do $$ begin
 if exists(select 1 from outify_dev.outfits where user_id='33333333-0000-4000-8000-000000000001')
 or exists(select 1 from outify_dev.outfit_items where user_id='33333333-0000-4000-8000-000000000001') then raise exception 'Baja incompleta'; end if;
end $$;
rollback;
