"use client";

import type { ImageLoaderProps } from "next/image";
import { staticImageUrl } from "./static-images.mjs";

export default function imageLoader({ src, width }: ImageLoaderProps) {
  return staticImageUrl(src, width);
}
