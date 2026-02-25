

## Analysis

The canonical URL issue has two parts:

1. **`index.html` has a hardcoded canonical**: `<link rel="canonical" href="https://verdedoro.it" />` — this applies to every page as a default before React Helmet overrides it. On pages where Helmet doesn't set a canonical (or sets it conditionally), this hardcoded one persists.

2. **Homepage (`Index.tsx`)**: The canonical is only rendered when `seoContent.canonical_url` is truthy (line 349: `{seoContent.canonical_url && <link rel="canonical" ... />}`). When the CMS field is empty, no canonical is emitted by Helmet, so the hardcoded `index.html` one (`https://verdedoro.it`) remains — which is correct for the homepage but wrong for every other page.

3. **Other pages** mostly handle it correctly (self-referencing when CMS field is empty), but `MicrogreensCustom.tsx` uses the raw CMS value without prepending the origin, and `CosaSonoMicrogreens.tsx` hardcodes `https://verdedoro.it` instead of using `window.location.origin`.

### Pages and their current canonical behavior:

| Page | Current behavior | Issue |
|------|-----------------|-------|
| `index.html` | Hardcoded `https://verdedoro.it` | Leaks to all pages where Helmet doesn't override |
| `Index.tsx` | Only renders canonical if CMS field is filled | Missing self-referencing canonical → falls back to index.html's hardcoded one (ok for homepage, but fragile) |
| `ChiSiamo.tsx` | Correct — self-references `/chi-siamo` when empty | None |
| `Contatti.tsx` | Correct — self-references `/contatti` when empty | None |
| `Microgreens.tsx` | Correct — self-references `/microgreens` when empty | None |
| `Blog.tsx` | Correct — self-references `/blog` when empty | None |
| `BlogArticle.tsx` | Correct — self-references `/blog/{slug}` when empty | None |
| `ProductDetail.tsx` | Correct — self-references `/microgreens/{slug}` when empty | None |
| `CosaSonoMicrogreens.tsx` | Hardcodes `https://verdedoro.it` as base | Should use `window.location.origin` |
| `MicrogreensCustom.tsx` | Uses raw CMS value without prepending origin | Broken when CMS field is filled (path only, no domain) |

## Plan

### 1. Remove hardcoded canonical from `index.html`
Remove `<link rel="canonical" href="https://verdedoro.it" />` — every page should manage its own canonical via React Helmet.

### 2. Fix `Index.tsx` (homepage)
Change from conditional rendering to always rendering a canonical. When CMS field is empty, self-reference with `window.location.origin + "/"`. When filled, prepend origin to the path.

### 3. Fix `MicrogreensCustom.tsx`
When CMS canonical field is filled, prepend `window.location.origin`. When empty, self-reference with `window.location.origin + "/microgreens-su-misura"`.

### 4. Fix `CosaSonoMicrogreens.tsx`
Replace hardcoded `https://verdedoro.it` with `window.location.origin`.

All other pages already follow the correct pattern and need no changes.

