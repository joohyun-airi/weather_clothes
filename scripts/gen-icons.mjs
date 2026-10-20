// PWA 아이콘 생성: npm run icons
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const svg = readFileSync(new URL('../public/icons/favicon.svg', import.meta.url));
// maskable: 안전 영역(80%) 안에 들어오도록 배경 위에 축소 배치
const maskable = Buffer.from(
  readFileSync(new URL('../public/icons/favicon.svg', import.meta.url), 'utf8')
    .replace('<rect width="512" height="512" rx="112" fill="url(#g)"/>', '<rect width="512" height="512" fill="url(#g)"/><g transform="translate(64 64) scale(.75)">')
    .replace('</svg>', '</g></svg>'),
);
const out = (n) => new URL(`../public/icons/${n}`, import.meta.url).pathname.replace(/^\/(\w:)/, '$1');

await sharp(svg).resize(192, 192).png().toFile(out('icon-192.png'));
await sharp(svg).resize(512, 512).png().toFile(out('icon-512.png'));
await sharp(maskable).resize(512, 512).png().toFile(out('icon-maskable-512.png'));
// iOS는 투명/라운드 처리를 직접 하므로 꽉 찬 배경으로
await sharp(maskable).resize(180, 180).flatten({ background: '#4c6ef5' }).png().toFile(out('apple-touch-icon-180.png'));
console.log('icons done');
