import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { heroPreloadPlugin } from "./vite-plugin-hero-preload";
import { criticalCssPlugin } from "./vite-plugin-critical-css";

// 1. Importiamo i nuovi plugin per la SEO
import vitePrerender from "vite-plugin-prerender";
import Sitemap from "vite-plugin-sitemap";

// 2. Definiamo la lista esatta delle tue pagine per i bot social e Google
const seoRoutes = [
  "/",
  "/microgreens",
  "/microgreens/broccoli",
  "/microgreens/crescione-romagna",
  "/microgreens/ravanello",
  "/microgreens/mais",
  "/microgreens/girasole",
  "/microgreens/pak-choi",
  "/microgreens/coriandolo",
  "/cosa-sono-i-microgreens",
  "/microgreens-su-misura",
  "/blog",
  "/blog/proprieta-nutrizionali-dei-microgreens",
  "/contatti",
  "/chi-siamo",
];

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
    // Inline critical CSS, lazy-load the rest
    mode === "production" && criticalCssPlugin(),

    // 3. Genera file HTML statici per i bot di Pinterest/Facebook
    mode === "production" &&
      vitePrerender({
        staticDir: path.join(__dirname, "dist"),
        routes: seoRoutes,
      }),

    // 4. Genera automaticamente la sitemap.xml pulita sul tuo dominio
    mode === "production" &&
      Sitemap({
        hostname: "https://microgreens.verdedoro.it",
        dynamicRoutes: seoRoutes,
        outDir: "dist",
      }),
  ].filter(Boolean),
  build: {
    // Vite/Rollup gestisce automaticamente il code-splitting
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
