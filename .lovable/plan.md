

## Add Vendor Chunk Splitting to Vite Build

### Current State
Route-based code splitting is **already fully implemented** in `App.tsx`:
- Homepage, Microgreens, and ProductDetail load eagerly (critical paths)
- All other pages (admin, blog, chi-siamo, contatti, previews) use `React.lazy()`
- `Suspense` with `PageLoading` fallback is configured

The one remaining optimization is **vendor chunk splitting** via Vite's `manualChunks`.

### What This Changes
**File: `vite.config.ts`** -- Add `build.rollupOptions.output.manualChunks`

Split large vendor dependencies into separate, long-cached chunks:

```typescript
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'react-vendor': ['react', 'react-dom', 'react-router-dom'],
        'ui-vendor': [
          '@radix-ui/react-dialog',
          '@radix-ui/react-dropdown-menu',
          '@radix-ui/react-select',
          '@radix-ui/react-tabs',
          '@radix-ui/react-toast',
          '@radix-ui/react-tooltip',
          '@radix-ui/react-popover',
          'lucide-react',
        ],
        'supabase-vendor': ['@supabase/supabase-js'],
        'query-vendor': ['@tanstack/react-query'],
      },
    },
  },
}
```

### Why This Helps
- Vendor libraries rarely change, so separate chunks get **long-term browser caching**
- When you update app code, users only re-download the app chunk, not vendor code
- Reduces the "Reduce unused JavaScript" warning by keeping vendor code in parallel-loaded chunks

### What We Are NOT Doing
- We are **not** adding manual chunks for admin pages -- Vite already splits them automatically via `React.lazy()`, and adding them to `manualChunks` would conflict with the dynamic imports
- We are **not** lazy-loading ProductDetail or Microgreens since they are critical pages that need to load immediately

### Files Changed
1. `vite.config.ts` -- Add `build.rollupOptions.output.manualChunks` configuration
