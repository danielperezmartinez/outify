-- Verificación SQL remota o local con identidad sintética y rollback.
-- No prueba HTTP, Google OAuth ni la eliminación física mediante Storage API.
begin;
select set_config('outify_test.user_id',gen_random_uuid()::text,true);
select set_config('outify_test.session_id',gen_random_uuid()::text,true);
insert into auth.users(id,email) values(current_setting('outify_test.user_id')::uuid,
 'outify-check-'||current_setting('outify_test.user_id')||'@example.invalid');
insert into auth.sessions(id,user_id,created_at,updated_at) values
 (current_setting('outify_test.session_id')::uuid,current_setting('outify_test.user_id')::uuid,now()-interval '1 minute',now());
select set_config('request.jwt.claims',json_build_object('sub',current_setting('outify_test.user_id'),
 'session_id',current_setting('outify_test.session_id'),'role','authenticated')::text,true);
set local role authenticated;
do $$begin
 if outify_dev.get_workspace_status()<>'age_required' then raise exception 'Estado inicial incorrecto'; end if;
 begin
  perform outify_dev.activate_workspace(false);
  raise exception 'TEST: edad no validada';
 exception when raise_exception then if sqlerrm like 'TEST:%' then raise; end if; end;
 perform outify_dev.activate_workspace(true);
 perform outify.activate_workspace(true);
 if outify_dev.request_account_deletion()<>'pending' then raise exception 'Baja no registrada'; end if;
 if outify_dev.request_account_deletion()<>'pending' then raise exception 'Baja no idempotente'; end if;
 if exists(select 1 from outify_dev.profiles) then raise exception 'Espacio pendiente accesible'; end if;
 if not exists(select 1 from outify.profiles) then raise exception 'Otro entorno bloqueado'; end if;
end $$;
reset role;
select set_config('request.jwt.claims','{"role":"service_role"}',true);
set local role service_role;
do $$declare job jsonb;begin
 job=outify_dev.claim_account_deletion(current_setting('outify_test.user_id')::uuid);
 if job is null then raise exception 'No se adquirió la baja'; end if;
 if outify_dev.claim_account_deletion(current_setting('outify_test.user_id')::uuid) is not null then raise exception 'Lease duplicado'; end if;
 if outify_dev.account_deletion_batch((job->>'user_id')::uuid,(job->>'lease_id')::uuid)<>'[]'::jsonb then raise exception 'Lote inesperado'; end if;
 if outify_dev.finish_account_deletion((job->>'user_id')::uuid,(job->>'lease_id')::uuid) then raise exception 'No respeta margen de cargas'; end if;
end $$;
reset role;
-- Adelanta exclusivamente el reloj de la solicitud sintética de esta transacción.
update outify_dev_private.account_lifecycle set requested_at=now()-interval '3 hours',next_attempt_at=now()
 where user_id=current_setting('outify_test.user_id')::uuid;
set local role service_role;
do $$declare job jsonb;begin
 job=outify_dev.claim_account_deletion(current_setting('outify_test.user_id')::uuid);
 if not outify_dev.finish_account_deletion((job->>'user_id')::uuid,(job->>'lease_id')::uuid) then raise exception 'Baja no finalizada'; end if;
end $$;
reset role;
do $$begin
 if exists(select 1 from outify_dev.profiles where id=current_setting('outify_test.user_id')::uuid) then raise exception 'Perfil no eliminado'; end if;
 if not exists(select 1 from outify.profiles where id=current_setting('outify_test.user_id')::uuid) then raise exception 'Otro entorno eliminado'; end if;
 if not exists(select 1 from auth.users where id=current_setting('outify_test.user_id')::uuid) then raise exception 'Identidad compartida eliminada'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('outify_test.user_id'),
 'session_id',current_setting('outify_test.session_id'),'role','authenticated')::text,true);
set local role authenticated;
do $$begin
 begin
  perform outify_dev.activate_workspace(true,true);
  raise exception 'TEST: sesión antigua reabrió el espacio';
 exception when raise_exception then if sqlerrm like 'TEST:%' then raise; end if; end;
end $$;
reset role;
select set_config('outify_test.fresh_session',gen_random_uuid()::text,true);
insert into auth.sessions(id,user_id,created_at,updated_at) values
 (current_setting('outify_test.fresh_session')::uuid,current_setting('outify_test.user_id')::uuid,clock_timestamp(),clock_timestamp());
select set_config('request.jwt.claims',json_build_object('sub',current_setting('outify_test.user_id'),
 'session_id',current_setting('outify_test.fresh_session'),'role','authenticated')::text,true);
set local role authenticated;
select outify_dev.activate_workspace(true,true);
do $$begin
 if outify_dev.get_workspace_status()<>'active' then raise exception 'Reapertura incorrecta'; end if;
end $$;
select set_config('request.jwt.claims',json_build_object('sub',current_setting('outify_test.user_id'),
 'session_id',current_setting('outify_test.session_id'),'role','authenticated')::text,true);
do $$begin
 if outify_dev.get_workspace_status()<>'reauth_required' then raise exception 'Token antiguo sigue activo'; end if;
 if exists(select 1 from outify_dev.profiles) then raise exception 'Token antiguo lee espacio nuevo'; end if;
end $$;
rollback;
