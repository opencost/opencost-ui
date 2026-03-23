import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const legacyBase =
  process.env.VITE_LEGACY_MODE === "true" && process.env.VITE_LEGACY_BASENAME
    ? `${process.env.VITE_LEGACY_BASENAME}/`
    : "/";

export default defineConfig({
  base: legacyBase,
  plugins: [reactRouter(), tsconfigPaths()],
  resolve: {
    alias: {
      "~": path.resolve(__dirname, "app"),
      // Resolve ~@ibm/plex for Carbon Design System font URLs (Webpack convention)
      "~@ibm/plex": path.resolve(__dirname, "node_modules/@ibm/plex"),
    },
  },
  css: {
    preprocessorOptions: {
      scss: { loadPaths: ["node_modules"] },
    },
  },
  server: {
    proxy: {
      "/model": {
        target: "http://localhost:9090",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/model/, ""),
      },
    },
  },
});
