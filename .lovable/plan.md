

## Optimize Render-Blocking CSS for PageSpeed

### Problem
PageSpeed Insights reports a 15.8 KiB CSS file (`index-*.css`) blocking rendering for ~480ms, impacting FCP and LCP.

### Context
- Vite is the bundler, Tailwind CSS is used for styling
- Tailwind already purges unused classes in production builds (configured via `content` in `tailwind.config.ts`)
- CSS is already minified by Vite's production build
- The 15.8 KiB size is actually quite small -- the main issue is that it's render-blocking, not its size

### Solution: Inline Critical CSS with Critters

Use the `@playform/critters` Vite plugin (successor to Google's `critters`) to automatically:
1. Extract critical above-the-fold CSS
2. Inline it directly into the HTML `<style>` tag
3. Lazy-load the remaining CSS asynchronously

This eliminates the render-blocking request entirely without manual CSS extraction.

### Implementation

**1. Install dependency**
- Add `@playform/critters` (the maintained fork of Google's critters, works without a headless browser)

**2. Update `vite.config.ts`**
- Import and add the critters plugin to the Vite plugins array
- Configure it for production builds only

```typescript
import critters from "@playform/critters";

export default defineConfig(({ mode }) => ({
  // ...existing config
  plugins: [
    react(),
    mode === "development" && componentTagger(),
    mode === "production" && heroPreloadPlugin(),
    mode === "production" && critters({
      // Inline critical CSS, lazy-load the rest
      preload: "swap",
      // Don't remove the original CSS file (it gets lazy-loaded)
      pruneSource: false,
    }),
  ].filter(Boolean),
}));
```

**3. Fix build error in edge function**
The typecheck error in `send-quote-request/index.ts` is unrelated but needs fixing. The Resend import uses `npm:resend@2.0.0` which Deno can't resolve during typecheck. This is a pre-existing issue and won't be changed as part of this task (edge functions deploy separately).

### What This Achieves
- Critical CSS (above-the-fold styles) gets inlined into `<style>` in the HTML
- The full CSS file loads asynchronously (non-blocking)
- Users see styled content immediately instead of a blank screen
- Estimated 160ms savings per PageSpeed report
- No manual CSS extraction needed -- fully automated at build time

### Technical Notes
- Critters works by analyzing the HTML output and determining which CSS rules are needed for the initial viewport
- It does NOT require a headless browser (unlike other critical CSS tools), making it fast and reliable
- The remaining CSS loads via `<link rel="stylesheet" media="print" onload="this.media='all'">` pattern (same technique already used for Google Fonts)
- At 15.8 KiB total CSS, the inlined portion will be very small (likely 3-5 KiB), well within acceptable inline limits

