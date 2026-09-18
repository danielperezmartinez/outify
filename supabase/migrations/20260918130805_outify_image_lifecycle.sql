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
