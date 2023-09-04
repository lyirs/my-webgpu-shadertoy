import topLevelAwait from "vite-plugin-top-level-await";
import { defineConfig } from "vite";

export default defineConfig({
  base: "./",
  plugins: [
    topLevelAwait({
      promiseExportName: "__tla",
      promiseImportName: (i) => `__tla_${i}`,
    }),
  ],
});
