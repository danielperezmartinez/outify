import { writeFileSync, existsSync } from 'node:fs';
if (existsSync('.env.local')) process.loadEnvFile('.env.local');
const production =
  process.env.VERCEL_ENV === 'production' || process.env.OUTIFY_ENV === 'production';
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
