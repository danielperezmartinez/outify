import { writeFileSync, existsSync, readFileSync } from 'node:fs';
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
// Vercel siempre prevalece: una variable local nunca convierte una Preview en producción.
const production = process.env.VERCEL_ENV
  ? process.env.VERCEL_ENV === 'production'
  : process.env.OUTIFY_ENV === 'production';
const { version } = JSON.parse(readFileSync('package.json', 'utf8'));
writeFileSync(
  'src/app/platform/app-version.ts',
  `// Generado desde package.json.\nexport const appVersion = ${JSON.stringify(version)};\n`,
);
const workerConfig = JSON.parse(readFileSync('ngsw-config.template.json', 'utf8'));
writeFileSync(
  'ngsw-config.json',
  JSON.stringify({ ...workerConfig, appData: { version } }, null, 2) + '\n',
);
const config = {
  url: process.env.SUPABASE_URL || 'https://zckqbrwdgxohdymiwbfz.supabase.co',
  key: process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_4Km0kzBpB6C3LJDDjO3cbg_V9vKSvod',
  schema: production ? 'outify' : 'outify_dev',
  bucket: production ? 'outify-item-images' : 'outify-dev-item-images',
};
if (!config.key.startsWith('sb_publishable_'))
  throw new Error('Usa exclusivamente una clave pública sb_publishable_.');
writeFileSync(
  'src/app/platform/runtime-config.ts',
  `// Generado; solo configuración pública.\nexport const runtimeConfig = ${JSON.stringify(config, null, 2)} as const;\n`,
);
