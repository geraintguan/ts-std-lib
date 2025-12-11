import { globSync } from "node:fs";
import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: globSync(resolve(__dirname, "src/**/*.ts"), {
        exclude: ["src/**/*.test.ts"],
      }),
      fileName: (format, fileName) => {
        const extension = format === "cjs" ? "js" : "mjs";
        return `${fileName}.${extension}`;
      },
      formats: ["es"],
      name: "Std",
    },
    minify: false,
    rollupOptions: {
      output: {
        preserveModules: true,
      },
    },
  },
  plugins: [
    dts({
      exclude: ["**/*.test.ts"],
      tsconfigPath: resolve(__dirname, "tsconfig.build.json"),
    }),
  ],
  test: {
    coverage: {
      all: true,
      include: ["src/**"],
    },
  },
});
