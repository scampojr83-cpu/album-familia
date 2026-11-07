// Gera os ícones PNG do app a partir de design/icones/icone-escolhido.svg.
// Uso: npm run icones (precisa do Playwright/Chromium instalado).
import { createRequire } from 'node:module';
import { readFileSync, copyFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const svg = readFileSync('design/icones/icone-escolhido.svg', 'utf8');
const tamanhos = [
  ['public/pwa-192.png', 192],
  ['public/pwa-512.png', 512],
  ['public/apple-touch-icon.png', 180],
  ['public/favicon-48.png', 48],
];

const browser = await chromium.launch();
const page = await browser.newPage();
for (const [arquivo, px] of tamanhos) {
  await page.setViewportSize({ width: px, height: px });
  await page.setContent(
    `<style>html,body{margin:0}svg{display:block;width:${px}px;height:${px}px}</style>${svg}`
  );
  await page.screenshot({ path: arquivo, omitBackground: false });
}
await browser.close();
copyFileSync('design/icones/icone-escolhido.svg', 'public/favicon.svg');
console.log('Ícones gerados em public/');
