import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { heroPreloadPlugin } from "./vite-plugin-hero-preload";
import { criticalCssPlugin } from "./vite-plugin-critical-css";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Inject hero image preload during production build
    mode === "production" && heroPreloadPlugin(),
    // Inline critical CSS, lazy-load the rest (eliminates render-blocking CSS)
    mode === "production" && criticalCssPlugin(),
  ].filter(Boolean),
  build: {
    // Let Vite/Rollup handle code-splitting automatically via lazy routes
    // This avoids loading unused vendor code on pages that don't need it
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
