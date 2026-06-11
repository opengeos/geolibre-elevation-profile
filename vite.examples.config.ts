import { defineConfig } from "vite";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Builds the standalone landing page and example into dist-examples/ for
// GitHub Pages. The base path matches the project Pages URL
// (https://opengeos.github.io/geolibre-elevation-profile/).
export default defineConfig({
  base: "/geolibre-elevation-profile/",
  build: {
    outDir: "dist-examples",
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        basic: resolve(__dirname, "examples/basic/index.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"),
    },
  },
});
