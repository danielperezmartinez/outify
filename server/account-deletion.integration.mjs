// Solo contra Supabase local desechable. Nunca recibe URL ni credenciales remotas.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { handleDeletion } from './account-deletion.mjs';

const settings = Object.fromEntries(
  [...readFileSync('tmp/local-supabase.env', 'utf8').matchAll(/^(\w+)="(.*)"$/gm)].map((m) => [
    m[1],
    m[2],
  ]),
);
const url = settings.API_URL;
assert.ok(
  ['http://127.0.0.1:54321', 'http://localhost:54321'].includes(url),
  'Solo se permite Supabase local',
);
const secret = settings.SECRET_KEY || settings.SERVICE_ROLE_KEY;
const publicKey = settings.PUBLISHABLE_KEY || settings.ANON_KEY;
const options = (schema) => ({
  db: { schema },
  auth: { persistSession: false, autoRefreshToken: false },
});
const admin = createClient(url, secret, options('outify_dev'));
const user = createClient(url, publicKey, options('outify_dev'));
const password = randomUUID();
const email = `lifecycle-${randomUUID()}@example.invalid`;
const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
assert.ifError(created.error);
const uid = created.data.user.id;
assert.match(uid, /^[a-f\d-]{36}$/);
const sql = (query) =>
  execFileSync(
    'docker',
    [
      'exec',
      'supabase_db_outify-lifecycle',
      'psql',
      '-U',
      'postgres',
      '-d',
      'postgres',
      '-At',
      '-v',
      'ON_ERROR_STOP=1',
      '-c',
      query,
    ],
    { encoding: 'utf8' },
  ).trim();
const value = async (result) => {
  const { data, error } = await result;
  assert.ifError(error);
  return data;
};
const session = await value(user.auth.signInWithPassword({ email, password }));
const token = session.session.access_token;
const production = createClient(url, publicKey, {
  ...options('outify'),
  global: { headers: { Authorization: `Bearer ${token}` } },
});
const env = {
  SUPABASE_URL: url,
  SUPABASE_PUBLISHABLE_KEY: publicKey,
  OUTIFY_SUPABASE_SECRET_KEY: secret,
  OUTIFY_ENV: 'development',
};
const request = () =>
  new Request('http://localhost/api/account-deletion', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ confirmation: 'ELIMINAR', user_id: randomUUID(), schema: 'outify' }),
  });

assert.equal(await value(user.rpc('get_workspace_status')), 'age_required');
assert.ok((await user.rpc('activate_workspace', { age_confirmed: false })).error);
assert.ok((await user.from('profiles').insert({ id: uid })).error);
await value(user.rpc('activate_workspace', { age_confirmed: true }));
await value(production.rpc('activate_workspace', { age_confirmed: true }));
assert.equal(await value(user.rpc('get_workspace_status')), 'active');
const wardrobe = (await value(user.from('wardrobes').select('id')))[0].id;
assert.ok(wardrobe);

// Otra aplicación simulada con FK central: su fila debe sobrevivir a la baja de Outify.
sql(
  `create schema if not exists lifecycle_fixture; create table if not exists lifecycle_fixture.members(id uuid primary key references auth.users on delete cascade); insert into lifecycle_fixture.members values('${uid}');`,
);
const image = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jPWoAAAAASUVORK5CYII=',
  'base64',
);
const imagePath = `${uid}/nested/photo.png`;
await value(
  user.storage
    .from('outify-dev-item-images')
    .upload(imagePath, image, { contentType: 'image/png' }),
);
await value(
  production.storage
    .from('outify-item-images')
    .upload(`${uid}/keep.png`, image, { contentType: 'image/png' }),
);
const signed = await value(
  user.storage.from('outify-dev-item-images').createSignedUploadUrl(`${uid}/late.png`),
);

const response = await handleDeletion(request(), env);
assert.equal(response.status, 202);
assert.equal(await value(user.rpc('get_workspace_status')), 'pending');
assert.deepEqual(await value(user.from('wardrobes').select('*')), []);
assert.ok((await user.rpc('initialize_user_workspace')).error);
assert.ok(
  (
    await user.storage
      .from('outify-dev-item-images')
      .upload(`${uid}/blocked.png`, image, { contentType: 'image/png' })
  ).error,
);
assert.ok(
  (
    await user.storage
      .from('outify-dev-item-images')
      .uploadToSignedUrl(`${uid}/late.png`, signed.token, image, { contentType: 'image/png' })
  ).error,
);
assert.equal(
  sql(
    `select count(*) from storage.objects where bucket_id='outify-dev-item-images' and name like '${uid}/%';`,
  ),
  '0',
);
assert.ok((await value(production.from('profiles').select('id'))).length);
assert.equal(sql(`select count(*) from lifecycle_fixture.members where id='${uid}';`), '1');
assert.ok((await value(admin.auth.admin.getUserById(uid))).user);

// Avanza solo el reloj de la solicitud de prueba; no se espera 2 h en el test.
sql(
  `update outify_dev_private.account_lifecycle set requested_at=now()-interval '3 hours',next_attempt_at=now()-interval '1 minute' where user_id='${uid}';`,
);
const claims = await Promise.all([
  admin.rpc('claim_account_deletion', { target_user: uid }),
  admin.rpc('claim_account_deletion', { target_user: uid }),
]);
assert.equal(claims.filter((c) => c.data).length, 1, 'Solo un worker puede adquirir el trabajo');
const lease = claims.find((c) => c.data).data;
await value(admin.rpc('defer_account_deletion', { target_user: uid, claim: lease.lease_id }));
sql(
  `update outify_dev_private.account_lifecycle set next_attempt_at=now()-interval '1 minute' where user_id='${uid}';`,
);
const finished = await handleDeletion(request(), env);
assert.equal(finished.status, 200);
assert.equal((await finished.json()).status, 'deleted');
assert.equal(sql(`select count(*) from outify_dev.profiles where id='${uid}';`), '0');
assert.equal(sql(`select count(*) from outify.profiles where id='${uid}';`), '1');
assert.equal(
  sql(
    `select count(*) from storage.objects where bucket_id='outify-item-images' and name='${uid}/keep.png';`,
  ),
  '1',
);
assert.equal(sql(`select count(*) from lifecycle_fixture.members where id='${uid}';`), '1');
assert.ok(
  (await user.rpc('activate_workspace', { age_confirmed: true, start_new: true })).error,
  'Token antiguo no puede reabrir',
);

const freshUser = createClient(url, publicKey, options('outify_dev'));
await value(freshUser.auth.signInWithPassword({ email, password }));
await value(freshUser.rpc('activate_workspace', { age_confirmed: true, start_new: true }));
assert.equal(await value(freshUser.rpc('get_workspace_status')), 'active');
assert.equal(await value(user.rpc('get_workspace_status')), 'reauth_required');
assert.deepEqual(await value(user.from('wardrobes').select('*')), []);
assert.ok(
  (await user.rpc('request_account_deletion')).error,
  'Sesión antigua no puede borrar el espacio nuevo',
);
assert.ok((await user.rpc('activate_workspace', { age_confirmed: true })).error);
assert.ok(
  (await freshUser.rpc('claim_account_deletion', { target_user: uid })).error,
  'RPC worker denegada a usuarios',
);
console.log(
  'OK: edad, RLS, Storage real, URL firmada previa, idempotencia, lease, otros entornos/apps y reapertura sin tokens antiguos.',
);
