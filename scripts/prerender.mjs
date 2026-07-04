// Injeta o HTML estático da home no dist/index.html após o build.
// Roda depois de `vite build` (cliente) e `vite build --ssr` (servidor).
import { readFileSync, writeFileSync, rmSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distDir = process.env.PRERENDER_DIST || path.join(root, 'dist');
const ssrEntry = path.join(root, '.ssr-dist', 'entry-server.js');
const indexPath = path.join(distDir, 'index.html');
const ROOT_DIV = '<div id="root"></div>';

if (!existsSync(ssrEntry)) {
  throw new Error(`Bundle SSR não encontrado em ${ssrEntry}. Rode "vite build --ssr" antes.`);
}

const { render } = await import(ssrEntry);
const appHtml = render('/');

let template = readFileSync(indexPath, 'utf-8');
if (!template.includes(ROOT_DIV)) {
  throw new Error(`Não encontrei "${ROOT_DIV}" em ${indexPath}; nada para pré-renderizar.`);
}

template = template.replace(ROOT_DIV, `<div id="root">${appHtml}</div>`);
writeFileSync(indexPath, template);

// O cliente usa createRoot().render(), que substitui esse HTML ao hidratar —
// então não há risco de mismatch; o markup serve apenas a crawlers/scrapers.
rmSync(path.join(root, '.ssr-dist'), { recursive: true, force: true });

console.log(`✓ Home pré-renderizada em ${path.relative(root, indexPath)} (${appHtml.length} bytes de HTML)`);
