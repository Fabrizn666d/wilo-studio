import { mkdir } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const [input, output, widthValue = "1920", qualityValue = "82"] = process.argv.slice(2);

if (!input || !output) {
  throw new Error("Uso: node scripts/optimize-image.mjs <entrada> <salida.webp> [ancho] [calidad]");
}

const width = Number.parseInt(widthValue, 10);
const quality = Number.parseInt(qualityValue, 10);

if (!Number.isFinite(width) || width < 320 || !Number.isFinite(quality) || quality < 1 || quality > 100) {
  throw new Error("El ancho o la calidad no son válidos.");
}

await mkdir(path.dirname(path.resolve(output)), { recursive: true });

const info = await sharp(input)
  .rotate()
  .resize({ width, withoutEnlargement: true })
  .webp({ quality, smartSubsample: true, effort: 6 })
  .toFile(output);

process.stdout.write(`${output}: ${info.width}x${info.height}, ${info.size} bytes\n`);
