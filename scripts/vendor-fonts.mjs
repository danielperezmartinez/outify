// Descarga reproducible de las familias aprobadas; no se ejecuta durante la build.
import { mkdir, writeFile } from 'node:fs/promises';
const source =
  'https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400..700&family=Geologica:wght@300..600&family=IBM+Plex+Mono:wght@400;500&display=swap';
const response = await fetch(source, {
  headers: {
    'User-Agent':
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  },
});
if (!response.ok) throw new Error('No se pudo descargar la definición de fuentes');
const css = await response.text();
const blocks = css.match(/\/\* latin(?:-ext)? \*\/[\s\S]*?\}/g);
if (!blocks || blocks.length < 6) throw new Error('La respuesta de fuentes ha cambiado');
await mkdir('public/fonts', { recursive: true });
const replacements = new Map();
const sources = [];
for (const block of blocks) {
  const url = block.match(/url\(([^)]+)\)/)?.[1];
  if (!url?.startsWith('https://fonts.gstatic.com/') || !url.endsWith('.woff2'))
    throw new Error('Formato inesperado');
  if (!replacements.has(url)) {
    const name = `font-${replacements.size + 1}.woff2`;
    const file = await fetch(url);
    if (!file.ok) throw new Error('No se pudo descargar la fuente');
    await writeFile(`public/fonts/${name}`, new Uint8Array(await file.arrayBuffer()));
    replacements.set(url, `/fonts/${name}`);
    sources.push(`${name}: ${url}`);
  }
}
let localCss = blocks.join('\n');
for (const [url, path] of replacements) localCss = localCss.replaceAll(url, path);
await writeFile('src/fonts.css', localCss + '\n');
for (const family of ['atkinsonhyperlegiblenext', 'geologica', 'ibmplexmono']) {
  const url = `https://raw.githubusercontent.com/google/fonts/main/ofl/${family}/OFL.txt`;
  const license = await fetch(url);
  if (!license.ok) throw new Error(`Falta licencia de ${family}`);
  await writeFile(`public/fonts/${family}-OFL.txt`, await license.text());
}
await writeFile(
  'public/fonts/SOURCES.txt',
  `Fuentes autoalojadas de Google Fonts. Licencias SIL OFL adjuntas.\nOrigen CSS: ${source}\nFecha de descarga: ${new Date().toISOString()}\n${sources.join('\n')}\n`,
);
console.log(`${replacements.size} archivos WOFF2 y tres licencias guardados.`);
