import { resolve } from "path";
import dts from "vite-plugin-dts";
import { defineConfig } from "vitest/config";

export default defineConfig({
  build: {
    lib: {
      entry: {
        groupByUnique: resolve(__dirname, "src/groupByUnique.ts"),
        // Add other entry points as needed
      },
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
