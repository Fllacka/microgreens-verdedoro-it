

## Fix: Images Not Showing on Microgreens su Misura Page

### Root Cause

The `MediaSelector` component's `onChange` callback provides two parameters: `(imageId, imageUrl)`. However, the admin page for Microgreens su Misura only captures the first parameter (the media ID/UUID) and stores it in the `image_url` field. The frontend then tries to use this UUID as an image `src`, which obviously does not load.

Database evidence from the intro section confirms this: `"image_url": "f50cfaed-c92f-4cfe-be3e-074b02e333c0"` -- a UUID, not a URL.

### Solution

Adopt the same pattern used by other CMS pages: store a proper `image_id` field and resolve it to a URL on the frontend by querying the media table.

### Changes

**1. Admin page (`src/pages/admin/MicrogreensCustom.tsx`)**

Update the `MediaSelector` usage for both hero and intro sections to store a proper `image_id`:

```typescript
// Hero section - BEFORE:
<MediaSelector
  value={heroSection?.content?.image_url || ''}
  onChange={(url) => updateSectionContent('hero', 'image_url', url)}
/>

// Hero section - AFTER:
<MediaSelector
  value={heroSection?.content?.image_id || null}
  onChange={(id) => updateSectionContent('hero', 'image_id', id)}
/>

// Same fix for intro section: image_url -> image_id
```

**2. Public page (`src/pages/MicrogreensCustom.tsx`)**

Add logic to resolve media IDs to URLs by fetching from the media table (same pattern as the homepage hero):

```typescript
// Fetch image URLs from media IDs
const [heroImageUrl, setHeroImageUrl] = useState<string | null>(null);
const [introImageUrl, setIntroImageUrl] = useState<string | null>(null);

useEffect(() => {
  const imageIds = [
    heroSection?.content?.image_id,
    introSection?.content?.image_id
  ].filter(Boolean);
  
  if (imageIds.length > 0) {
    supabase.from('media').select('id, file_path')
      .in('id', imageIds)
      .then(({ data }) => {
        // Map IDs to URLs
      });
  }
}, [sections]);
```

Then use the resolved URLs (with static fallbacks) in the `<img>` tags.

**3. Preview page (`src/pages/preview/MicrogreensCustomPreview.tsx`)**

Apply the same media ID resolution logic as the public page, reading from draft content.

### Files Changed

1. `src/pages/admin/MicrogreensCustom.tsx` -- Fix MediaSelector onChange to store `image_id` instead of `image_url`
2. `src/pages/MicrogreensCustom.tsx` -- Resolve media IDs to URLs before rendering
3. `src/pages/preview/MicrogreensCustomPreview.tsx` -- Same resolution logic for preview

