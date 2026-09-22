-- Baja y admisión aisladas por aplicación y entorno. Nunca elimina auth.users.
create table outify_private.account_lifecycle (
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
alter table outify_private.account_lifecycle enable row level security;
revoke all on outify_private.account_lifecycle from public,anon,authenticated;
create index account_deletion_queue on outify_private.account_lifecycle(next_attempt_at) where status='pending';
-- Los perfiles existentes deben confirmar la edad; no se presume esa declaración.
insert into outify_private.account_lifecycle(user_id) select id from outify.profiles;

create function outify_private.workspace_active() returns boolean
language sql stable security definer set search_path='' as $$
 select exists(select 1 from outify_private.account_lifecycle a join auth.sessions s on s.user_id=a.user_id
  where a.user_id=auth.uid() and a.status='active' and a.age_confirmed_at is not null
  and s.id=nullif(auth.jwt()->>'session_id','')::uuid and (s.not_after is null or s.not_after>now())
  and (a.access_since is null or s.created_at>a.access_since));
$$;
create function outify_private.require_live_session() returns void
language plpgsql security definer set search_path='' as $$
begin
 if not exists(select 1 from auth.sessions where id=nullif(auth.jwt()->>'session_id','')::uuid
  and user_id=auth.uid() and (not_after is null or not_after>now())) then
  raise exception 'Vuelve a iniciar sesión para continuar';
 end if;
end $$;
create function outify_private.get_workspace_status() returns text
language plpgsql stable security definer set search_path='' as $$
begin
 if auth.uid() is null then raise exception 'Se requiere una sesión'; end if;
 if exists(select 1 from outify_private.account_lifecycle where user_id=auth.uid() and status='active')
  and not outify_private.workspace_active() then return 'reauth_required'; end if;
 return coalesce((select status from outify_private.account_lifecycle where user_id=auth.uid()),'age_required');
end $$;
create function outify.get_workspace_status() returns text language sql security invoker set search_path='' as $$
 select outify_private.get_workspace_status();
$$;

-- Serializa las escrituras ya iniciadas con la solicitud de baja.
create function outify_private.guard_workspace_write() returns trigger
language plpgsql security definer set search_path='' as $$
declare state text;
begin
 if auth.role()='authenticated' then
  select status into state from outify_private.account_lifecycle where user_id=auth.uid() for share;
  if state is distinct from 'active' or not outify_private.workspace_active() then raise exception 'Tu espacio no está activo'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
do $block$
declare t text;
begin
 foreach t in array array['profiles','wardrobes','zones','items','item_locations','tags','item_tags','image_cleanup'] loop
  execute format('create policy workspace_access on outify.%I as restrictive for all to authenticated using ((select outify_private.workspace_active())) with check ((select outify_private.workspace_active()))',t);
  execute format('create trigger guard_workspace_write before insert or update or delete on outify.%I for each row execute function outify_private.guard_workspace_write()',t);
 end loop;
end $block$;
revoke insert,delete on outify.profiles from authenticated;

alter function outify.initialize_user_workspace() set schema outify_private;
alter function outify_private.initialize_user_workspace() security definer;
create function outify.initialize_user_workspace() returns void
language plpgsql security invoker set search_path='' as $$
begin
 if not outify_private.workspace_active() then raise exception 'Confirma tu acceso a Outify antes de continuar'; end if;
 perform outify_private.initialize_user_workspace();
end $$;

create function outify_private.activate_workspace(age_confirmed boolean, start_new boolean) returns void
language plpgsql security definer set search_path='' as $$
declare state outify_private.account_lifecycle;
begin
 perform outify_private.require_live_session();
 if age_confirmed is distinct from true then raise exception 'Debes tener al menos 14 años para crear una cuenta'; end if;
 insert into outify_private.account_lifecycle(user_id) values(auth.uid()) on conflict do nothing;
 select * into state from outify_private.account_lifecycle where user_id=auth.uid() for update;
 if state.status='pending' then raise exception 'La eliminación sigue en curso'; end if;
 if state.status='deleted' then
  if start_new is distinct from true then raise exception 'Confirma que quieres crear un espacio nuevo'; end if;
  if not exists(select 1 from auth.sessions where id=(auth.jwt()->>'session_id')::uuid
    and user_id=auth.uid() and created_at>state.completed_at) then
   raise exception 'Vuelve a iniciar sesión para crear un espacio nuevo';
  end if;
 end if;
 update outify_private.account_lifecycle set status='active',age_confirmed_at=coalesce(age_confirmed_at,now()),
  access_since=case when state.status='deleted' then state.completed_at else access_since end,
  requested_at=null,completed_at=null,lease_id=null,lease_until=null,last_error=null,attempts=0
 where user_id=auth.uid();
 perform outify_private.initialize_user_workspace();
end $$;
create function outify.activate_workspace(age_confirmed boolean, start_new boolean default false) returns void
language sql security invoker set search_path='' as $$ select outify_private.activate_workspace(age_confirmed,start_new); $$;

create function outify_private.request_account_deletion() returns text
language plpgsql security definer set search_path='' as $$
declare state text;
begin
 perform outify_private.require_live_session();
 insert into outify_private.account_lifecycle(user_id) values(auth.uid()) on conflict do nothing;
 select status into state from outify_private.account_lifecycle where user_id=auth.uid() for update;
 if state in ('pending','deleted') then return state; end if;
 if state='active' and not outify_private.workspace_active() then raise exception 'Vuelve a iniciar sesión para continuar'; end if;
 update outify_private.account_lifecycle set status='pending',requested_at=clock_timestamp(),next_attempt_at=now(),
  age_confirmed_at=null,lease_id=null,lease_until=null,last_error=null where user_id=auth.uid();
 return 'pending';
end $$;
create function outify.request_account_deletion() returns text language sql security invoker set search_path='' as $$
 select outify_private.request_account_deletion();
$$;

-- Restrictiva: otra política permisiva del proyecto no puede abrir este bucket.
create policy outify_workspace_images on storage.objects as restrictive for all to authenticated,anon
using(bucket_id<>'outify-item-images' or ((storage.foldername(name))[1]=auth.uid()::text and (select outify_private.workspace_active())))
with check(bucket_id<>'outify-item-images' or ((storage.foldername(name))[1]=auth.uid()::text and (select outify_private.workspace_active())));

create function outify_private.guard_image_write() returns trigger
language plpgsql security definer set search_path='' as $$
declare path text; image_bucket text; state text;
begin
 if tg_op='DELETE' then path=old.name; image_bucket=old.bucket_id;
 else path=new.name; image_bucket=new.bucket_id; end if;
 -- El worker usa service_role; los tokens de subida firmados también deben respetar la baja.
 if image_bucket='outify-item-images' and (tg_op<>'DELETE' or coalesce(auth.role(),'')<>'service_role') then
  select status into state from outify_private.account_lifecycle where user_id=split_part(path,'/',1)::uuid for share;
  if state is distinct from 'active' then raise exception 'El espacio de estas imágenes no está activo'; end if;
 end if;
 if tg_op='DELETE' then return old; end if;
 return new;
end $$;
create trigger outify_guard_image_write before insert or update or delete on storage.objects
for each row execute function outify_private.guard_image_write();

-- RPC de mantenimiento: solo service_role. IDs y leases nunca vienen del formulario.
create function outify_private.claim_account_deletion(target_user uuid default null) returns jsonb
language plpgsql security definer set search_path='' as $$
declare result jsonb;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 with candidate as (
  select user_id from outify_private.account_lifecycle where status='pending'
   and (target_user is null or user_id=target_user) and next_attempt_at<=now()
   and (lease_until is null or lease_until<now()) order by next_attempt_at,user_id for update skip locked limit 1
 ), claimed as (
  update outify_private.account_lifecycle s set lease_id=gen_random_uuid(),lease_until=now()+interval '5 minutes',attempts=attempts+1
  from candidate c where s.user_id=c.user_id returning s.user_id,s.lease_id
 ) select to_jsonb(claimed) into result from claimed;
 return result;
end $$;
create function outify.claim_account_deletion(target_user uuid default null) returns jsonb
language sql security invoker set search_path='' as $$ select outify_private.claim_account_deletion(target_user); $$;

create function outify_private.account_deletion_batch(target_user uuid, claim uuid) returns jsonb
language plpgsql security definer set search_path='' as $$
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 if not exists(select 1 from outify_private.account_lifecycle where user_id=target_user and lease_id=claim
  and lease_until>now() and status='pending') then raise exception 'Trabajo no disponible'; end if;
 return (select coalesce(jsonb_agg(name),'[]'::jsonb) from (
  select name from storage.objects where bucket_id='outify-item-images'
   and name like target_user::text||'/%' order by name limit 100
 ) batch);
end $$;
create function outify.account_deletion_batch(target_user uuid, claim uuid) returns jsonb
language sql security invoker set search_path='' as $$ select outify_private.account_deletion_batch(target_user,claim); $$;

create function outify_private.finish_account_deletion(target_user uuid, claim uuid) returns boolean
language plpgsql security definer set search_path='' as $$
declare state outify_private.account_lifecycle;
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 select * into state from outify_private.account_lifecycle where user_id=target_user for update;
 if state.status is distinct from 'pending' or state.lease_id is distinct from claim or state.lease_until is null or state.lease_until<=now()
 then raise exception 'Trabajo no disponible'; end if;
 if exists(select 1 from storage.objects where bucket_id='outify-item-images' and name like target_user::text||'/%')
 then raise exception 'Quedan imágenes pendientes'; end if;
 -- Las URLs de subida previamente firmadas duran 2 h; se hace un último barrido después.
 if state.requested_at+interval '2 hours 5 minutes'>now() then
  update outify_private.account_lifecycle set lease_id=null,lease_until=null,
   next_attempt_at=state.requested_at+interval '2 hours 5 minutes',last_error=null where user_id=target_user;
  return false;
 end if;
 delete from outify.profiles where id=target_user;
 update outify_private.account_lifecycle set status='deleted',completed_at=now(),lease_id=null,lease_until=null,last_error=null
 where user_id=target_user;
 return true;
end $$;
create function outify.finish_account_deletion(target_user uuid, claim uuid) returns boolean
language sql security invoker set search_path='' as $$ select outify_private.finish_account_deletion(target_user,claim); $$;

create function outify_private.defer_account_deletion(target_user uuid, claim uuid) returns void
language plpgsql security definer set search_path='' as $$
begin
 if auth.role() is distinct from 'service_role' then raise exception 'Solo mantenimiento'; end if;
 update outify_private.account_lifecycle set lease_id=null,lease_until=null,next_attempt_at=now()+interval '15 minutes',last_error='cleanup_retry'
 where user_id=target_user and lease_id=claim and status='pending';
end $$;
create function outify.defer_account_deletion(target_user uuid, claim uuid) returns void
language sql security invoker set search_path='' as $$ select outify_private.defer_account_deletion(target_user,claim); $$;

revoke all on function outify_private.workspace_active(),outify_private.require_live_session(),outify_private.get_workspace_status(),
 outify_private.guard_workspace_write(),outify_private.guard_image_write(),outify_private.initialize_user_workspace(),
 outify_private.activate_workspace(boolean,boolean),outify_private.request_account_deletion(),
 outify_private.claim_account_deletion(uuid),outify_private.account_deletion_batch(uuid,uuid),
 outify_private.finish_account_deletion(uuid,uuid),outify_private.defer_account_deletion(uuid,uuid)
 from public,anon,authenticated;
grant execute on function outify_private.workspace_active() to authenticated,anon;
grant execute on function outify_private.get_workspace_status(),outify_private.initialize_user_workspace(),
 outify_private.activate_workspace(boolean,boolean),outify_private.request_account_deletion() to authenticated;
grant usage on schema outify_private,outify to service_role;
grant execute on function outify_private.claim_account_deletion(uuid),outify_private.account_deletion_batch(uuid,uuid),
 outify_private.finish_account_deletion(uuid,uuid),outify_private.defer_account_deletion(uuid,uuid) to service_role;
revoke all on function outify.initialize_user_workspace(),outify.get_workspace_status(),outify.activate_workspace(boolean,boolean),outify.request_account_deletion(),
 outify.claim_account_deletion(uuid),outify.account_deletion_batch(uuid,uuid),outify.finish_account_deletion(uuid,uuid),outify.defer_account_deletion(uuid,uuid)
 from public,anon,authenticated;
grant execute on function outify.initialize_user_workspace(),outify.get_workspace_status(),outify.activate_workspace(boolean,boolean),outify.request_account_deletion() to authenticated;
grant execute on function outify.claim_account_deletion(uuid),outify.account_deletion_batch(uuid,uuid),outify.finish_account_deletion(uuid,uuid),outify.defer_account_deletion(uuid,uuid) to service_role;

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
