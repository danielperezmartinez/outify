import { test } from 'node:test';
import assert from 'node:assert/strict';
import { verifyRelease } from './verify-release.mjs';

test('acepta únicamente incrementos SemVer de una publicación', () => {
  for (const next of ['0.1.1', '0.2.0', '1.0.0'])
    assert.doesNotThrow(() => verifyRelease('0.1.0', next));
  for (const next of ['0.1.0', '0.0.9', '0.1.2', '01.2.0', '0.2.0-beta', '2.0.0']) {
    assert.throws(() => verifyRelease('0.1.0', next));
  }
});
