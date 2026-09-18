const userAgent = process.env.npm_config_user_agent ?? '';

if (!userAgent.startsWith('pnpm/')) {
  console.error(
    'Outify solo admite pnpm. Usa "pnpm install" y sustituye npx por "pnpm exec" o "pnpm dlx".',
  );
  process.exit(1);
}
