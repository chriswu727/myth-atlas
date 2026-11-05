import type { NextConfig } from "next";
import { imageWidths } from "./src/lib/static-images.mjs";

const nextConfig: NextConfig = {
  images: {
    loader: "custom",
    loaderFile: "./src/lib/image-loader.ts",
    deviceSizes: imageWidths.filter((width) => width >= 640),
    imageSizes: imageWidths.filter((width) => width < 640),
  },
};

export default nextConfig;
