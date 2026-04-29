import path from "node:path";
import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const viteBasename = process.env.VITE_BASENAME
const base = viteBasename ? viteBasename.endsWith(`/`) ? viteBasename : `${viteBasename}/` : `/`;

export default defineConfig({
  base: base,
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
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
