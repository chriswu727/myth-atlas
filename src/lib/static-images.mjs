export const imageWidths = [160, 320, 640, 1000, 1600];

export function staticImageUrl(src, width) {
  if (!/^\/images\/.+\.(jpe?g|png|webp)$/i.test(src)) return src;
  const size = imageWidths.find((candidate) => candidate >= width) ?? imageWidths.at(-1);
  return `/image-variants/${size}${src}.webp`;
}
