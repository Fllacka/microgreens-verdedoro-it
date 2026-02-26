

## Summary

The sitemap needs two fixes: (1) admin pages for Homepage, ChiSiamo, Microgreens, and Contatti don't persist `changeFrequency` and `priority` to the database, and (2) the edge function uses hardcoded values instead of reading from the DB.

### Current state

| Admin page | `changeFrequency` persisted? | `priority` persisted? |
|---|---|---|
| Homepage | No (hardcoded "daily", missing from fieldMap) | No (hardcoded "1.0", missing from fieldMap) |
| ChiSiamo | No (hardcoded "monthly", missing from fieldMap) | No (hardcoded "0.7", missing from fieldMap) |
| Microgreens | No (hardcoded "weekly", missing from fieldMap) | No (hardcoded "0.8", missing from fieldMap) |
| Contatti | No (hardcoded "monthly", missing from fieldMap) | No (hardcoded "0.5", missing from fieldMap) |
| MicrogreensCustom | `changeFrequency` yes, `priority` missing from fieldMap | Partially |
| CosaSonoMicrogreens | Yes (uses camelCase keys in JSONB) | Yes |
| BlogOverview | Yes | Yes |
| BlogEdit (blog_posts table) | Yes (dedicated columns) | Yes |
| ProductEdit (products table) | Yes (dedicated columns) | Yes |
| PageEdit (pages table) | Yes (dedicated columns) | Yes |

## Plan

### 1. Fix admin field maps to persist `changeFrequency` and `priority`

**Files**: `Homepage.tsx`, `ChiSiamo.tsx`, `Microgreens.tsx`, `Contatti.tsx`, `MicrogreensCustom.tsx`

For each file:
- Add `changeFrequency: "change_frequency"` and `priority: "priority"` to the `fieldMap` in `handleSEOChange` / inline onChange
- Read `changeFrequency` and `priority` from DB in `seoValues` initialization instead of hardcoding (e.g., `seoContent.change_frequency || "weekly"`)

### 2. Rewrite sitemap edge function

**File**: `supabase/functions/sitemap/index.ts`

- Set `SITE_URL` to `https://microgreens.verdedoro.it`
- For each of the 7 static pages, query the corresponding section table's `seo` row to get real `updated_at`, `change_frequency`, and `priority`. The section tables use two different key formats:
  - **snake_case** (Homepage, ChiSiamo, Microgreens, Contatti, MicrogreensCustom, BlogOverview): `content->>'change_frequency'`, `content->>'priority'`
  - **camelCase** (CosaSonoMicrogreens): `content->>'changeFrequency'`, `content->>'priority'`
- Include all 7 static pages with their correct paths:
  - `/` from `homepage_sections`
  - `/microgreens` from `microgreens_sections`
  - `/microgreens-su-misura` from `microgreens_custom_sections`
  - `/chi-siamo` from `chi_siamo_sections`
  - `/cosa-sono-i-microgreens` from `cosa_sono_microgreens_sections`
  - `/blog` from `blog_overview_sections`
  - `/contatti` from `contatti_sections`
- Keep existing logic for dynamic pages (`products`, `blog_posts`, `pages` tables) which already have dedicated `change_frequency` and `priority` columns
- Skip any entry where `robots` contains `noindex`
- Add `Cache-Control: public, max-age=3600` header
- Use full absolute URLs (`https://microgreens.verdedoro.it/...`)

### 3. Update `robots.txt`

Change the Sitemap directive to: `Sitemap: https://microgreens.verdedoro.it/sitemap`

