-- Pruebas aisladas: datos funcionales únicamente en outify_dev y rollback completo.
begin;
insert into auth.users(id,email) values
 ('11111111-0000-4000-8000-000000000001','outify-test-a@example.invalid'),
 ('11111111-0000-4000-8000-000000000002','outify-test-b@example.invalid');
set local role authenticated;
select set_config('request.jwt.claim.sub','11111111-0000-4000-8000-000000000001',true);
select outify_dev.initialize_user_workspace();
select outify_dev.initialize_user_workspace();
do $$begin
 if (select count(*) from outify_dev.wardrobes)<>1 then raise exception 'Inicialización duplicada'; end if;
 if (select count(*) from outify_dev.zones)<>2 then raise exception 'Plantilla incorrecta'; end if;
end$$;
select outify_dev.save_item('{"name":"Camisa","category":"top","image_path":"11111111-0000-4000-8000-000000000001/test.png","seasons":["summer"]}',(select min(id) from outify_dev.zones),array['Lino','lino']);
do $$begin
 if (select count(*) from outify_dev.tags)<>1 then raise exception 'Etiquetas duplicadas'; end if;
 if (select count(*) from outify_dev.item_locations)<>1 then raise exception 'Ubicación no guardada'; end if;
end$$;
select set_config('request.jwt.claim.sub','11111111-0000-4000-8000-000000000002',true);
do $$begin
 if exists(select 1 from outify_dev.items) or exists(select 1 from outify_dev.wardrobes) then raise exception 'Fuga RLS'; end if;
end$$;
select outify_dev.initialize_user_workspace();
do $$begin
 begin
  insert into outify_dev.items(user_id,name,category,image_path) values('11111111-0000-4000-8000-000000000001','Ajeno','top','11111111-0000-4000-8000-000000000001/other.png');
  raise exception 'RLS permitió inserción ajena';
 exception when insufficient_privilege then null; end;
end$$;
select set_config('request.jwt.claim.sub','11111111-0000-4000-8000-000000000001',true);
update outify_dev.items set status='archived' where name='Camisa';
do $$begin
 if exists(select 1 from outify_dev.item_locations) then raise exception 'Archivado conserva ubicación'; end if;
 begin
  insert into outify_dev.item_locations(item_id,zone_id) select i.id,z.id from outify_dev.items i cross join outify_dev.zones z limit 1;
  raise exception 'Archivado admite ubicación';
 exception when raise_exception then if sqlerrm='Archivado admite ubicación' then raise; end if; end;
end$$;
update outify_dev.items set status='active' where name='Camisa';
insert into outify_dev.item_locations(item_id,zone_id) select i.id,z.id from outify_dev.items i cross join outify_dev.zones z limit 1;
delete from outify_dev.wardrobes where name='Mi armario';
do $$begin
 if not exists(select 1 from outify_dev.items) then raise exception 'Eliminar armario eliminó prenda'; end if;
 if exists(select 1 from outify_dev.item_locations) then raise exception 'Ubicación huérfana'; end if;
end$$;
select outify_dev.initialize_user_workspace();
do $$begin if exists(select 1 from outify_dev.wardrobes) then raise exception 'Se recreó plantilla eliminada'; end if; end$$;
update outify_dev.items set status='archived' where name='Camisa';
select outify_dev.delete_archived_item((select id from outify_dev.items limit 1));
do $$begin
 if exists(select 1 from outify_dev.items) then raise exception 'Borrado no completado'; end if;
 if not exists(select 1 from outify_dev.image_cleanup) then raise exception 'Falta limpieza persistente'; end if;
end$$;
rollback;
