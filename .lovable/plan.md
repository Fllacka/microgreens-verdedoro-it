

## Blog CMS Issues and Fixes

After reviewing the BlogEdit, ProductEdit, and preview code, I found several issues causing problems with saving new blog articles and viewing their preview.

### Issues Found

1. **No auto-slug generation from title**: When creating a new blog post, the slug (in the SEO tab) starts empty. If the user saves without manually setting a slug, the insert succeeds with an empty slug `""`, making previews impossible and causing duplicate key errors on subsequent new posts.

2. **Excerpt uses `<Textarea>` instead of `<RichTextEditor>`**: The blog preview renders the excerpt with `dangerouslySetInnerHTML`, expecting HTML content. But the editor uses a plain `<Textarea>`, so rich formatting is lost. The project memory explicitly states excerpt should use RichTextEditor.

3. **No validation before save**: Neither `saveDraft` nor `publishPost` validate that required fields (title, slug) are filled before attempting the database operation, leading to cryptic error messages.

4. **Preview URL is undefined when slug is empty**: The "Salva e Anteprima" button disappears entirely because `previewUrl` is undefined when `seoData.slug` is empty.

### Plan

#### 1. Add auto-slug generation from title (`BlogEdit.tsx`)
- Create a `generateSlug` utility function that converts Italian-friendly titles to URL slugs (lowercase, replace spaces/accents with hyphens)
- Auto-populate `seoData.slug` from `formData.title` when slug is empty (on title change for new posts only)
- This matches how most CMS systems work and removes the need to visit the SEO tab first

#### 2. Replace Textarea with RichTextEditor for excerpt (`BlogEdit.tsx`)
- Change the excerpt field from `<Textarea>` to `<RichTextEditor>` component
- This aligns with the preview rendering and the project's established pattern

#### 3. Add validation before save/publish (`BlogEdit.tsx`)
- In both `saveDraft` and `publishPost`, validate that `formData.title` and `seoData.slug` are non-empty before proceeding
- Show a clear toast error message if validation fails (e.g., "Inserisci un titolo e uno slug prima di salvare")

#### 4. Apply same auto-slug to ProductEdit for consistency (`ProductEdit.tsx`)
- Add the same auto-slug generation from product name to keep both editors consistent

### Technical Details

**Slug generation function** (added to `BlogEdit.tsx` or a shared util):
```typescript
const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
};
```

**Auto-slug on title change** (new posts only):
```typescript
// In the title onChange handler, auto-generate slug if it hasn't been manually edited
if (isNew && !slugManuallyEdited) {
  setSeoData(prev => ({ ...prev, slug: generateSlug(newTitle) }));
}
```

### Files to modify
- `src/pages/admin/BlogEdit.tsx` - auto-slug, excerpt RichTextEditor, validation
- `src/pages/admin/ProductEdit.tsx` - auto-slug for consistency

