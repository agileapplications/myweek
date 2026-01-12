import { defineConfig } from "vite";
import solidPlugin from "vite-plugin-solid";

export default defineConfig({
  plugins: [solidPlugin()],
  server: {
    host: "localhost",
    port: 5173,
    hmr: true,
  },
  build: {
    outDir: "public/vite",
    emptyOutDir: true,
  },
});
