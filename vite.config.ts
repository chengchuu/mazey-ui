import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";
import dts from "vite-plugin-dts";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));

export default defineConfig({
  plugins: [
    dts({
      include: [ "src" ],
      exclude: [ "src/**/*.test.tsx", "src/test" ],
      insertTypesEntry: true,
    }),
  ],
  build: {
    lib: {
      entry: resolve(projectRoot, "src/index.ts"),
      formats: [ "es", "cjs" ],
      fileName: (format) => format === "es" ? "index.js" : "index.cjs",
      cssFileName: "styles",
    },
    rollupOptions: {
      external: [ "react", "react-dom", "react/jsx-runtime" ],
    },
  },
  test: {
    environment: "jsdom",
    setupFiles: [ "./src/test/setup.ts" ],
  },
});
