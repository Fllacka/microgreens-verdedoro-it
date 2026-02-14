

## Responsive Images: Pre-Generated Sizes on Upload

### Overview
When an image is uploaded to the CMS, a backend function will automatically generate 3 resized versions as real static files. The frontend will use standard HTML `srcset` and `sizes` attributes so browsers pick the right size per device.

### Migration Portability
Yes -- migrating is exactly as simple as you described:
1. Download the entire `cms-media` bucket (contains `uploads/` and `uploads/responsive/`)
2. Upload to any new hosting (static file server, S3, etc.)
3. Update the base URL in the database
All files are plain WebP with predictable naming. The frontend uses standard `srcset` -- no vendor-specific APIs.

### Architecture

```text
Upload Flow:
  Admin uploads image
       |
       v
  Original saved to storage (uploads/abc123.webp)
       |
       v
  Backend function called (generate-responsive-images)
       |
       v
  Uses magick-wasm (WASM-based, no native dependencies) to resize:
    uploads/responsive/abc123_sm.webp   (400w)
    uploads/responsive/abc123_md.webp   (800w)
    uploads/responsive/abc123_lg.webp   (1200w)
       |
       v
  Updates media table: optimized_urls = {
    sm: "https://.../abc123_sm.webp",
    md: "https://.../abc123_md.webp",
    lg: "https://.../abc123_lg.webp",
    original: "https://.../abc123.webp"
  }
```

```text
Frontend Output:
  <img
    src="original.webp"
    srcset="sm.webp 400w, md.webp 800w, lg.webp 1200w"
    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 1200px"
    loading="lazy"
  />
```

### Why magick-wasm Instead of sharp

The backend functions run on Deno-based edge runtime, which does not support native Node modules like `sharp`. The official Supabase documentation recommends `magick-wasm` (the WebAssembly port of ImageMagick) for image processing in edge functions. It handles resize + format conversion without any native dependencies.

**Important limitation**: `magick-wasm` works well for images under ~3-5MB. Since your images are pre-compressed WebP files (typically under 500KB based on your upload recommendations), this is well within the safe range.

### Storage Impact

For a typical 200KB original WebP image:
- Small (400w): ~30-50KB
- Medium (800w): ~80-120KB
- Large (1200w): ~150-180KB
- Total per image: roughly 2-3x the original

For 100 images, that is approximately 50-70MB of additional storage. Very manageable.

### Implementation Steps

#### Step 1: New Backend Function
**New file: `supabase/functions/generate-responsive-images/index.ts`**

- Downloads original image from storage
- Uses `magick-wasm` to resize to 400w, 800w, and 1200w (maintaining aspect ratio)
- Outputs all versions as WebP with quality 80
- Uploads each version to `uploads/responsive/` in the same bucket
- Updates the `media` table `optimized_urls` column with public URLs for each size
- Replaces the existing `process-image` function (which currently just copies files without resizing)

#### Step 2: Remove Old Function
**Delete: `supabase/functions/process-image/index.ts`**

The old function never actually resized images -- it just copied the original. The new function replaces it entirely.

#### Step 3: Update Upload Flows (3 files)
Call the new function after every image upload:

- **`src/pages/admin/Media.tsx`**: After the database insert in the upload loop, invoke `generate-responsive-images` with the storage path and media ID. Also add a "Genera versioni responsive" button to batch-process existing images that lack responsive versions.
- **`src/components/admin/MediaSelector.tsx`**: After inline upload and database insert, invoke the function.
- **`src/components/admin/ImageDialog.tsx`**: Replace the `process-image` call with `generate-responsive-images`.

#### Step 4: Update OptimizedImage Component
**Modify: `src/components/ui/optimized-image.tsx`**

- Un-deprecate the `optimizedUrls` prop
- Add a new `sizes` prop (string) for layout-specific sizing hints
- When `optimizedUrls` contains `sm`, `md`, `lg` URLs, generate a `srcset` attribute
- When not provided, fall back to current single-`src` behavior (backward compatible)

#### Step 5: Update Image Consumers
Pass `optimizedUrls` from media records and specify appropriate `sizes`:

- **`src/pages/ProductDetail.tsx`** (line 276): Product hero image -- `sizes="(max-width: 768px) 100vw, 50vw"`
- **`src/components/ProductCard.tsx`**: Grid cards -- `sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"`
- **`src/components/ContentBlockRenderer.tsx`**: Content block images -- appropriate sizes per layout type

#### Step 6: Add Helper Utility
**Modify: `src/lib/image-utils.ts`**

Add a `buildSrcSet` helper function that takes an `optimizedUrls` object and returns a properly formatted `srcset` string. This keeps the logic centralized and reusable.

### Files Changed Summary

| File | Action | Purpose |
|------|--------|---------|
| `supabase/functions/generate-responsive-images/index.ts` | Create | New resize function using magick-wasm |
| `supabase/functions/process-image/index.ts` | Delete | Replaced by new function |
| `supabase/config.toml` | Update | Add new function config, remove old |
| `src/components/ui/optimized-image.tsx` | Modify | Add srcset/sizes support |
| `src/lib/image-utils.ts` | Modify | Add buildSrcSet helper |
| `src/pages/admin/Media.tsx` | Modify | Call resize function + batch process button |
| `src/components/admin/MediaSelector.tsx` | Modify | Call resize function after upload |
| `src/components/admin/ImageDialog.tsx` | Modify | Call resize function after upload |
| `src/pages/ProductDetail.tsx` | Modify | Pass responsive URLs + sizes |
| `src/components/ProductCard.tsx` | Modify | Pass responsive URLs + sizes |
| `src/components/ContentBlockRenderer.tsx` | Modify | Pass responsive URLs + sizes |

### What Does Not Change
- No database schema changes (the `optimized_urls` column already exists)
- No changes to the storage bucket configuration
- No external service dependencies
- Your upload workflow stays the same (drag and drop in CMS)
- All existing images continue to work (they just won't have responsive versions until batch-processed)

