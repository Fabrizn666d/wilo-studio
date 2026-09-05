import sharp from 'sharp';
import { mkdir, copyFile } from 'node:fs/promises';
import path from 'node:path';

const root = process.cwd();
const generated = 'C:/Users/FAbri/.codex/generated_images/01a07266-6a87-74d1-a5dd-1762abf9172f';
const output = path.join(root, 'public/images/wilo/closing');
await mkdir(output, { recursive: true });
for (const [source, target] of [
  ['exec-d66fde3e-ac7b-4e51-82dc-63d841f07c3d.png', 'international-desk.webp'],
  ['exec-0b7df786-77e1-4e91-ac12-320f6425a2cb.png', 'contact-mascot.webp'],
]) {
  await sharp(path.join(generated, source)).resize({ width: 1536, withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(output, target));
}
const sheets = path.join(root, 'public/mascot/sticker-sheets');
await mkdir(sheets, { recursive: true });
for (const [source, target] of [
  ['ChatGPT Image 7 ago 2026, 14_28_35.png', 'payments-development.png'],
  ['ChatGPT Image 7 ago 2026, 14_28_41.png', 'customer-care.png'],
  ['ChatGPT Image 7 ago 2026, 14_30_35.png', 'commercial-personality.png'],
]) await copyFile(path.join('C:/Users/FAbri/Downloads', source), path.join(sheets, target));
console.log('Closing scene media optimized; three original sticker sheets preserved.');
