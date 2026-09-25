-- Diagnóstico de solo lectura sin UUID, correos ni contenido de los usuarios.
-- Ejecutar con rol de mantenimiento; no expone ninguna RPC pública.
select 'outify' as environment,
 count(*) filter(where status='pending') as pending,
 count(*) filter(where status='pending' and last_error is not null) as retry_errors,
 count(*) filter(where status='pending' and requested_at<now()-interval '48 hours') as older_than_48h,
 min(requested_at) filter(where status='pending') as oldest_request,
 min(next_attempt_at) filter(where status='pending') as next_attempt
from outify_private.account_lifecycle
union all
select 'outify_dev',
 count(*) filter(where status='pending'),
 count(*) filter(where status='pending' and last_error is not null),
 count(*) filter(where status='pending' and requested_at<now()-interval '48 hours'),
 min(requested_at) filter(where status='pending'),
 min(next_attempt_at) filter(where status='pending')
from outify_dev_private.account_lifecycle;
