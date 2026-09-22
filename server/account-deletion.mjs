import { createClient } from '@supabase/supabase-js';
import { timingSafeEqual } from 'node:crypto';

const environments = {
  outify: 'outify-item-images',
  outify_dev: 'outify-dev-item-images',
};

export function serverConfig(env = process.env) {
  if (!env.SUPABASE_URL || !env.SUPABASE_PUBLISHABLE_KEY || !env.OUTIFY_SUPABASE_SECRET_KEY)
    throw new Error('account_deletion_not_configured');
  const production = env.VERCEL_ENV
    ? env.VERCEL_ENV === 'production'
    : env.OUTIFY_ENV === 'production';
  return {
    url: env.SUPABASE_URL,
    publicKey: env.SUPABASE_PUBLISHABLE_KEY,
    secret: env.OUTIFY_SUPABASE_SECRET_KEY,
    schema: production ? 'outify' : 'outify_dev',
  };
}

function client(config, schema, token) {
  if (!Object.hasOwn(environments, schema)) throw new Error('invalid_environment');
  return createClient(config.url, token ? config.publicKey : config.secret, {
    db: { schema },
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    global: {
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {}),
      fetch: (url, options) => fetch(url, { ...options, signal: AbortSignal.timeout(8000) }),
    },
  });
}

async function rpc(backend, name, args = {}) {
  const { data, error } = await backend.rpc(name, args);
  if (error) throw new Error(name);
  return data;
}

// La lista procede de SQL por bucket/prefijo, incluyendo carpetas y archivos huérfanos.
export async function processDeletion(backend, schema, job, deadline = Date.now() + 30000) {
  const bucket = environments[schema];
  if (!bucket || !job?.user_id || !job?.lease_id) throw new Error('invalid_job');
  const args = { target_user: job.user_id, claim: job.lease_id };
  try {
    while (Date.now() < deadline) {
      const paths = await rpc(backend, 'account_deletion_batch', args);
      if (
        !Array.isArray(paths) ||
        paths.some((path) => typeof path !== 'string' || !path.startsWith(`${job.user_id}/`))
      )
        throw new Error('invalid_storage_scope');
      if (!paths.length) return await rpc(backend, 'finish_account_deletion', args);
      const { error } = await backend.storage.from(bucket).remove(paths);
      if (error) throw new Error('storage_cleanup_failed');
    }
    await rpc(backend, 'defer_account_deletion', args);
    return false;
  } catch (error) {
    // Si también falla la BD, la concesión caduca y otro worker puede recuperarla.
    await rpc(backend, 'defer_account_deletion', args).catch(() => {});
    throw error;
  }
}

function json(body, status) {
  return Response.json(body, {
    status,
    headers: { 'Cache-Control': 'no-store', Vary: 'Authorization' },
  });
}

export async function handleDeletion(request, env = process.env, makeClient = client) {
  const deadline = Date.now() + 30000;
  if (request.method !== 'POST') return json({ error: 'Método no permitido' }, 405);
  if (
    request.headers.get('origin') &&
    request.headers.get('origin') !== new URL(request.url).origin
  )
    return json({ error: 'Origen no permitido' }, 403);
  const token = request.headers.get('authorization')?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return json({ error: 'Inicia sesión para continuar' }, 401);
  let config;
  try {
    config = serverConfig(env);
  } catch {
    return json({ error: 'La baja no está disponible. Contacta con soporte.' }, 503);
  }
  let body;
  try {
    body = await request.json();
  } catch {
    return json({ error: 'Confirma la eliminación' }, 400);
  }
  if (body?.confirmation !== 'ELIMINAR') return json({ error: 'Confirma la eliminación' }, 400);
  const userClient = makeClient(config, config.schema, token);
  let user;
  try {
    const result = await userClient.auth.getUser(token);
    if (result.error || !result.data.user) return json({ error: 'Vuelve a iniciar sesión' }, 401);
    user = result.data.user;
  } catch {
    return json({ error: 'No se pudo verificar la sesión. Reintenta.' }, 503);
  }
  let status;
  try {
    status = await rpc(userClient, 'request_account_deletion');
  } catch {
    return json({ error: 'No se pudo registrar la baja. Vuelve a intentarlo.' }, 503);
  }
  if (status === 'deleted') return json({ status }, 200);
  try {
    const admin = makeClient(config, config.schema);
    const job = await rpc(admin, 'claim_account_deletion', { target_user: user.id });
    if (job && (await processDeletion(admin, config.schema, job, deadline)))
      return json({ status: 'deleted' }, 200);
  } catch {
    console.error('outify_account_deletion_retry_required');
  }
  // La solicitud ya está confirmada en BD aunque falle la limpieza o la conexión.
  return json({ status: 'pending' }, 202);
}

export async function handleDeletionCron(request, env = process.env, makeClient = client) {
  if (request.method !== 'GET') return json({ error: 'Método no permitido' }, 405);
  const expected = env.CRON_SECRET && Buffer.from(`Bearer ${env.CRON_SECRET}`);
  const provided = Buffer.from(request.headers.get('authorization') ?? '');
  if (!expected || expected.length !== provided.length || !timingSafeEqual(expected, provided))
    return json({ error: 'No autorizado' }, 401);
  if (env.VERCEL_ENV !== 'production') return json({ error: 'Solo producción' }, 403);
  try {
    const config = serverConfig(env);
    const deadline = Date.now() + 30000;
    // El cron de producción mantiene las dos colas; no admite esquemas del request.
    // Ambas progresan en paralelo: una cola grande no consume el turno de la otra.
    const results = await Promise.all(
      Object.keys(environments).map(async (schema) => {
        let processed = 0;
        let failed = 0;
        try {
          const admin = makeClient(config, schema);
          while (Date.now() < deadline) {
            const job = await rpc(admin, 'claim_account_deletion');
            if (!job) break;
            try {
              await processDeletion(admin, schema, job, deadline);
              processed++;
            } catch {
              failed++;
            }
          }
        } catch {
          // Un error al obtener trabajos no cancela la limpieza del otro entorno.
          failed++;
        }
        return { processed, failed };
      }),
    );
    const processed = results.reduce((total, result) => total + result.processed, 0);
    const failed = results.reduce((total, result) => total + result.failed, 0);
    return json({ processed, failed }, failed ? 503 : 200);
  } catch {
    console.error('outify_account_deletion_cron_failed');
    return json({ error: 'No se pudo completar el mantenimiento' }, 503);
  }
}
