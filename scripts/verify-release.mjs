import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';

export function verifyRelease(previous, next) {
  const pattern = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
  if (!pattern.test(previous) || !pattern.test(next))
    throw new Error('Usa versiones estables major.minor.patch.');
  const [major, minor, patch] = previous.split('.').map(Number);
  const allowed = [`${major + 1}.0.0`, `${major}.${minor + 1}.0`, `${major}.${minor}.${patch + 1}`];
  if (!allowed.includes(next))
    throw new Error(`Acuerda un incremento SemVer desde ${previous}: ${allowed.join(', ')}.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const base = process.argv[2];
  if (!base || !/^[a-f0-9]{40}$/.test(base))
    throw new Error('Indica el SHA base completo de la pull request.');
  const previous = JSON.parse(
    execFileSync('git', ['show', `${base}:package.json`], { encoding: 'utf8' }),
  ).version;
  const current = JSON.parse(readFileSync('package.json', 'utf8')).version;
  verifyRelease(previous, current);
  console.log(
    `Versión verificada: ${previous} → ${current}. El consenso humano se registra en la PR.`,
  );
}
