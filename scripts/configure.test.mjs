import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, copyFileSync, readFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

for (const [vercel, local, schema, bucket] of [
  ['preview', 'production', 'outify_dev', 'outify-dev-item-images'],
  ['development', 'production', 'outify_dev', 'outify-dev-item-images'],
  ['production', 'development', 'outify', 'outify-item-images'],
  ['', 'production', 'outify', 'outify-item-images'],
  ['', '', 'outify_dev', 'outify-dev-item-images'],
]) {
  test(`configura Vercel=${vercel || 'ausente'}, local=${local || 'ausente'}`, () => {
    const directory = mkdtempSync(join(tmpdir(), 'outify-config-'));
    try {
      mkdirSync(join(directory, 'src/app/platform'), { recursive: true });
      for (const name of ['package.json', 'ngsw-config.template.json'])
        copyFileSync(name, join(directory, name));
      execFileSync(process.execPath, [fileURLToPath(new URL('./configure.mjs', import.meta.url))], {
        cwd: directory,
        env: { ...process.env, VERCEL_ENV: vercel, OUTIFY_ENV: local },
      });
      const config = readFileSync(join(directory, 'src/app/platform/runtime-config.ts'), 'utf8');
      assert.match(config, new RegExp(`"schema": "${schema}"`));
      assert.match(config, new RegExp(`"bucket": "${bucket}"`));
      const version = JSON.parse(readFileSync('package.json', 'utf8')).version;
      assert.equal(
        JSON.parse(readFileSync(join(directory, 'ngsw-config.json'), 'utf8')).appData.version,
        version,
      );
      assert.ok(
        readFileSync(join(directory, 'src/app/platform/app-version.ts'), 'utf8').includes(version),
      );
    } finally {
      rmSync(directory, { recursive: true, force: true });
    }
  });
}
