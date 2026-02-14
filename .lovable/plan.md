

## Fix: LCP Hero Image Preload Not Working

### Problem
You already have a Vite plugin (`vite-plugin-hero-preload.ts`) designed to inject a `<link rel="preload">` for the hero image during build, but it silently fails every time due to two bugs:

1. **Environment variables not accessible**: The script uses `process.env.VITE_SUPABASE_URL`, but Vite does NOT populate `process.env` -- it uses `import.meta.env` for client code and requires explicit loading for build scripts.

2. **URL mismatch**: Even if the env vars worked, the plugin transforms the URL to a `/render/image/` path with WebP parameters, but the actual `<img>` tag on the homepage uses the raw `file_path` (`/storage/v1/object/public/...`). A preload is ignored by the browser if the URL doesn't match exactly.

### Solution

**File: `scripts/fetch-hero-url.ts`** -- Fix environment variable loading

Replace `process.env` with Vite's `loadEnv` or read from `.env` manually using Node's `dotenv`-style parsing. Since this runs during the Vite build (which is a Node process), we can use `import('dotenv')` or simply read the `.env` file directly with `fs`.

```typescript
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Parse .env file manually (runs during build, not in browser)
function loadEnvVars() {
  try {
    const envFile = readFileSync(resolve(process.cwd(), '.env'), 'utf-8');
    const vars: Record<string, string> = {};
    for (const line of envFile.split('\n')) {
      const match = line.match(/^(\w+)=["']?(.+?)["']?$/);
      if (match) vars[match[1]] = match[2];
    }
    return vars;
  } catch { return {}; }
}

const env = loadEnvVars();
const SUPABASE_URL = env.VITE_SUPABASE_URL;
const SUPABASE_KEY = env.VITE_SUPABASE_PUBLISHABLE_KEY;
```

**File: `scripts/fetch-hero-url.ts`** -- Remove URL transformation

The `getOptimizedHeroUrl` function should return the raw URL as-is (matching what the `<img>` tag actually uses), not a transformed render URL.

```typescript
export function getOptimizedHeroUrl(url: string): string {
  // Return the URL as-is to match the <img src> on the page
  return url;
}
```

**File: `vite-plugin-hero-preload.ts`** -- Update preload tag

Remove `type="image/webp"` since we're preloading the original image (which may be JPEG or PNG, not WebP).

```html
<link rel="preload" as="image" href="..." fetchpriority="high">
```

### What This Achieves
- The build will successfully fetch the hero image URL from the database
- The preload tag will be injected into the HTML `<head>` with the exact URL the page uses
- The browser discovers the hero image immediately when parsing `<head>`, before any JS runs
- This eliminates the "La richiesta e rilevabile nel documento iniziale" warning from PageSpeed

### Files Changed
1. `scripts/fetch-hero-url.ts` -- Fix env var loading + remove URL transformation
2. `vite-plugin-hero-preload.ts` -- Remove WebP type from preload tag

