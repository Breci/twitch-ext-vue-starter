import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { dirname, resolve } from "path";
import { fileURLToPath } from "url";
import basicSsl from "@vitejs/plugin-basic-ssl";
import { terser } from "rollup-plugin-terser";
import path from "path";

const __filename = fileURLToPath(import.meta.url);

const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [vue(), basicSsl()],
  build: {
    minify: false, // optional for twitch extensions, but we will use that to avoid longer review times
    rollupOptions: {
      input: {
        config: resolve(__dirname, "config.html"),
        "live-config": resolve(__dirname, "live-config.html"),
        panel: resolve(__dirname, "panel.html"),
        component: resolve(__dirname, "component.html"),
        overlay: resolve(__dirname, "overlay.html"),
        mobile: resolve(__dirname, "mobile.html"),
      },
      output: {
        manualChunks(id, { getModuleInfo }) {
          if (id.includes("node_modules")) {
            const importers = Object.values(getModuleInfo(id)?.importers || []);

            if (importers.length === 1) {
              const entryName = path.basename(importers[0], path.extname(importers[0]));
              return `vendor-${entryName}`;
            }

            return "vendor-shared"; // Shared fallback
          }
        }
      },
      plugins: [
        terser({
          format: {
            comments: false,
          },
          compress: {
            drop_console: true,
            drop_debugger: true,
          },
        }),
      ],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});
