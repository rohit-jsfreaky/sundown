import type { NextConfig } from "next";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

const nextConfig: NextConfig = {
  cacheComponents: true,
  devIndicators: false,
  partialPrefetching: true,
  // Hyper Elements' image engines: resvg is a native addon and satori reads a WebAssembly file (see its render-image docs).
  serverExternalPackages: ["@resvg/resvg-js", "satori"],
  turbopack: {
    // This folder is its own project (its own repo); a git repo further up must not become the root.
    root: dirname(fileURLToPath(import.meta.url)),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
