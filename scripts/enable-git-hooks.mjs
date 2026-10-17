// Activa los hooks versionados de .githooks al instalar dependencias.
// En CI o fuera de un clon git (p. ej. la build de Vercel) no hace nada.
import { execFileSync } from 'node:child_process';

if (!process.env.CI && !process.env.VERCEL) {
  try {
    execFileSync('git', ['rev-parse', '--is-inside-work-tree'], { stdio: 'ignore' });
    execFileSync('git', ['config', 'core.hooksPath', '.githooks'], { stdio: 'ignore' });
  } catch {
    // Sin git o sin repositorio: la instalación sigue.
  }
}
