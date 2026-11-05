import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, mkdir, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { buildImages } from "../scripts/build-images.mjs";
import { imageWidths, staticImageUrl } from "../src/lib/static-images.mjs";

test("responsive image URLs select a static variant and preserve unrelated sources", () => {
  assert.equal(staticImageUrl("/images/entries/mu.jpg", 500), "/image-variants/640/images/entries/mu.jpg.webp");
  assert.equal(staticImageUrl("/images/entries/mu.jpg", 2400), "/image-variants/1600/images/entries/mu.jpg.webp");
  for (const source of ["/icon.svg", "https://example.com/image.jpg", "data:image/png;base64,abc"]) {
    assert.equal(staticImageUrl(source, 320), source);
  }
});

test("image build produces every loader URL, preserves originals and avoids upscaling", async () => {
  const root = await mkdtemp(join(tmpdir(), "myth-static-images-"));
  try {
    await mkdir(join(root, "images", "entries"), { recursive: true });
    const input = join(root, "images", "entries", "sample.png");
    await sharp({ create: { width: 480, height: 600, channels: 4, background: { r: 120, g: 30, b: 50, alpha: 0.5 } } }).png().toFile(input);
    const original = await readFile(input);
    const result = await buildImages(root);
    assert.equal(result.sources, 1);
    assert.equal(result.variants, imageWidths.length);
    for (const width of imageWidths) {
      const output = join(root, staticImageUrl("/images/entries/sample.png", width));
      const metadata = await sharp(output).metadata();
      assert.equal(metadata.format, "webp");
      assert.equal(metadata.width, Math.min(width, 480));
      assert.equal(metadata.height, Math.min(width, 480) * 600 / 480);
      assert.equal(metadata.hasAlpha, true);
    }
    assert.deepEqual(await readFile(input), original);
    assert.deepEqual(await buildImages(root), result);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
