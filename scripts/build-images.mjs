import { mkdir, readdir, rm } from "node:fs/promises";
import { dirname, join } from "node:path";
import sharp from "sharp";
import { imageWidths, staticImageUrl } from "../src/lib/static-images.mjs";

export async function buildImages(publicDir) {
  const sourceDir = join(publicDir, "images");
  const files = (await readdir(sourceDir, { recursive: true }))
    .filter((file) => /\.(jpe?g|png|webp)$/i.test(file))
    .sort();
  await rm(join(publicDir, "image-variants"), { recursive: true, force: true });
  let index = 0;
  let bytes = 0;
  await Promise.all(Array.from({ length: 4 }, async () => {
    while (index < files.length) {
      const file = files[index++];
      for (const width of imageWidths) {
        const output = join(publicDir, staticImageUrl(`/images/${file}`, width));
        await mkdir(dirname(output), { recursive: true });
        const info = await sharp(join(sourceDir, file))
          .rotate()
          .resize({ width, withoutEnlargement: true })
          .webp({ quality: 78 })
          .toFile(output);
        bytes += info.size;
      }
    }
  }));
  return { sources: files.length, variants: files.length * imageWidths.length, bytes };
}
