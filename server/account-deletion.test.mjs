import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleDeletion,
  handleDeletionCron,
  processDeletion,
  serverConfig,
} from './account-deletion.mjs';

const job = { user_id: '11111111-1111-4111-8111-111111111111', lease_id: 'claim' };
const env = {
  SUPABASE_URL: 'http://localhost',
  SUPABASE_PUBLISHABLE_KEY: 'public',
  OUTIFY_SUPABASE_SECRET_KEY: 'secret',
};
const request = (body = { confirmation: 'ELIMINAR' }, authorization = 'Bearer valid') =>
  new Request('https://outify.test/api/account-deletion', {
    method: 'POST',
    headers: { Authorization: authorization, 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

test('la configuración de Preview prevalece sobre OUTIFY_ENV y falta de secretos falla cerrada', () => {
  assert.equal(
    serverConfig({ ...env, VERCEL_ENV: 'preview', OUTIFY_ENV: 'production' }).schema,
    'outify_dev',
  );
  assert.throws(() => serverConfig({}), /not_configured/);
});

test('borra todos los lotes, incluidas rutas anidadas, antes de finalizar', async () => {
  const removed = [];
  const batches = [[`${job.user_id}/a.png`], [`${job.user_id}/nested/b.png`], []];
  const calls = [];
  const backend = {
    rpc: async (name, args) => {
      calls.push(name);
      assert.equal(args.target_user, job.user_id);
      return { data: name === 'account_deletion_batch' ? batches.shift() : true };
    },
    storage: {
      from: (bucket) => {
        assert.equal(bucket, 'outify-dev-item-images');
        return {
          remove: async (paths) => {
            removed.push(...paths);
            return {};
          },
        };
      },
    },
  };
  assert.equal(await processDeletion(backend, 'outify_dev', job), true);
  assert.equal(removed.length, 2);
  assert.equal(calls.at(-1), 'finish_account_deletion');
});

test('un fallo de Storage conserva la solicitud y no anuncia que ha terminado', async () => {
  const calls = [];
  const backend = {
    rpc: async (name) => {
      calls.push(name);
      return { data: [`${job.user_id}/a.png`] };
    },
    storage: { from: () => ({ remove: async () => ({ error: new Error('offline') }) }) },
  };
  await assert.rejects(processDeletion(backend, 'outify', job), /storage_cleanup_failed/);
  assert.deepEqual(calls, ['account_deletion_batch', 'defer_account_deletion']);
});

test('rechaza lotes fuera del propietario antes de borrar nada', async () => {
  let removed = false;
  const backend = {
    rpc: async () => ({ data: ['another-user/photo.png'] }),
    storage: {
      from: () => ({
        remove: async () => {
          removed = true;
          return {};
        },
      }),
    },
  };
  await assert.rejects(processDeletion(backend, 'outify', job), /invalid_storage_scope/);
  assert.equal(removed, false);
});

test('agotamiento del presupuesto libera el trabajo para reintento', async () => {
  const calls = [];
  const backend = {
    rpc: async (name) => {
      calls.push(name);
      return {};
    },
  };
  assert.equal(await processDeletion(backend, 'outify', job, 0), false);
  assert.deepEqual(calls, ['defer_account_deletion']);
});

test('sin autorización, confirmación o sesión válida nunca registra una baja', async () => {
  const forbidden = () => {
    throw new Error('must not run');
  };
  assert.equal((await handleDeletion(request({}, ''), env, forbidden)).status, 401);
  assert.equal((await handleDeletion(request({}), env, forbidden)).status, 400);
  const invalid = () => ({ auth: { getUser: async () => ({ data: { user: null }, error: {} }) } });
  assert.equal((await handleDeletion(request(), env, invalid)).status, 401);
  const crossOrigin = request();
  crossOrigin.headers.set('Origin', 'https://another.test');
  assert.equal((await handleDeletion(crossOrigin, env, forbidden)).status, 403);
});

test('ignora IDs y entornos del cuerpo, y un trabajo ya tomado no se duplica', async () => {
  const schemas = [];
  const factory = (config, schema, token) => {
    schemas.push(schema);
    if (token)
      return {
        auth: { getUser: async () => ({ data: { user: { id: job.user_id } } }) },
        rpc: async () => ({ data: 'pending' }),
      };
    return {
      rpc: async (name, args) => {
        assert.equal(name, 'claim_account_deletion');
        assert.equal(args.target_user, job.user_id);
        return { data: null };
      },
    };
  };
  const response = await handleDeletion(
    request({ confirmation: 'ELIMINAR', user_id: 'victim', schema: 'nocendland' }),
    env,
    factory,
  );
  assert.equal(response.status, 202);
  assert.deepEqual(schemas, ['outify_dev', 'outify_dev']);
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('cron sin secreto, con secreto erróneo o en Preview no ejecuta mantenimiento', async () => {
  const forbidden = () => {
    throw new Error('must not run');
  };
  const req = new Request('https://outify.test/api/account-deletion-retry', {
    headers: { Authorization: 'Bearer cron' },
  });
  assert.equal((await handleDeletionCron(req, env, forbidden)).status, 401);
  assert.equal(
    (await handleDeletionCron(req, { ...env, CRON_SECRET: 'other' }, forbidden)).status,
    401,
  );
  assert.equal(
    (
      await handleDeletionCron(
        req,
        { ...env, CRON_SECRET: 'cron', VERCEL_ENV: 'preview' },
        forbidden,
      )
    ).status,
    403,
  );
});

test('el cron procesa desarrollo aunque producción siga ocupada o no pueda obtener trabajos', async () => {
  let releaseProduction;
  const held = new Promise((resolve) => {
    releaseProduction = resolve;
  });
  let developmentFinished;
  const finished = new Promise((resolve) => {
    developmentFinished = resolve;
  });
  const claims = new Set();
  const factory = (config, schema) => ({
    rpc: async (name) => {
      if (name === 'claim_account_deletion') {
        if (schema === 'outify') {
          await held;
          return { error: new Error('production temporarily unavailable') };
        }
        if (claims.has(schema)) return { data: null };
        claims.add(schema);
        return { data: job };
      }
      if (name === 'account_deletion_batch') return { data: [] };
      if (name === 'finish_account_deletion') {
        developmentFinished();
        return { data: true };
      }
      throw new Error('unexpected RPC');
    },
  });
  const cronRequest = new Request('https://outify.test/api/account-deletion-retry', {
    headers: { Authorization: 'Bearer cron' },
  });
  const pending = handleDeletionCron(
    cronRequest,
    { ...env, CRON_SECRET: 'cron', VERCEL_ENV: 'production' },
    factory,
  );
  let timer;
  try {
    await Promise.race([
      finished,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error('development starved')), 1000);
      }),
    ]);
  } finally {
    clearTimeout(timer);
    releaseProduction();
  }
  const response = await pending;
  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), { processed: 1, failed: 1 });
});
