import sharp from "sharp";
import { rename, stat, unlink } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const publicDir = path.join(root, "public");
const appDir = path.join(root, "src", "app");

async function sizeLabel(filePath) {
  const { size } = await stat(filePath);
  return `${Math.round(size / 1024)}KB`;
}

async function writeThrough(tmpPath, outputPath) {
  await rename(tmpPath, outputPath);
}

async function optimizeNoiseTile() {
  const output = path.join(publicDir, "media", "noise.webp");
  const tmp = `${output}.tmp`;

  await sharp(output)
    .resize(128, 128, { fit: "cover" })
    .webp({ quality: 55, effort: 6 })
    .toFile(tmp);

  await writeThrough(tmp, output);
  console.log(`noise tile: ${await sizeLabel(output)}`);
}

async function optimizeBanner() {
  const output = path.join(publicDir, "banner.webp");
  const tmp = `${output}.tmp`;

  await sharp(output).webp({ quality: 82, effort: 6 }).toFile(tmp);
  await writeThrough(tmp, output);
  console.log(`banner: ${await sizeLabel(output)}`);
}

async function optimizeBgRemoval() {
  const output = path.join(publicDir, "media", "bg-removal.webp");
  const mobile = path.join(publicDir, "media", "bg-removal-mobile.webp");
  const tmp = `${output}.tmp`;

  await sharp(output).webp({ quality: 80, effort: 6 }).toFile(tmp);
  await writeThrough(tmp, output);

  await sharp(output)
    .resize(640, null, { withoutEnlargement: true })
    .webp({ quality: 78, effort: 6 })
    .toFile(mobile);

  console.log(`bg-removal: ${await sizeLabel(output)}, mobile: ${await sizeLabel(mobile)}`);
}

async function optimizeIcon() {
  const output = path.join(appDir, "icon.png");
  const tmp = `${output}.tmp`;

  await sharp(output)
    .resize(192, 192, { fit: "cover" })
    .png({ compressionLevel: 9, palette: true, colors: 128 })
    .toFile(tmp);

  await writeThrough(tmp, output);
  console.log(`icon: ${await sizeLabel(output)}`);
}

async function main() {
  await optimizeNoiseTile();
  await optimizeBanner();
  await optimizeBgRemoval();
  await optimizeIcon();
}

main().catch(async (error) => {
  console.error(error);
  process.exitCode = 1;
});
