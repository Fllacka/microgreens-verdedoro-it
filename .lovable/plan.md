

## Audit: Reduce Unused JavaScript on Homepage

### Findings

After auditing every file loaded on the homepage, here are the issues found and recommended fixes:

---

### 1. Remove Unused `date-fns` Imports from Index.tsx (Quick Win)

**File:** `src/pages/Index.tsx` (lines 14-15)

`format` from `date-fns` and `it` from `date-fns/locale` are imported but **never used** anywhere in the homepage component. The `ArticleCard` component handles its own date formatting with native `toLocaleDateString()`. 

The `date-fns` library is ~16KB gzipped, and importing the `it` locale adds more. Since Index.tsx is eagerly loaded, this dead code ships to every visitor.

**Fix:** Remove lines 14-15 entirely.

---

### 2. Remove Unused `Leaf` Icon Import from Index.tsx (Minor)

**File:** `src/pages/Index.tsx` (line 7)

The `Leaf` icon is imported from `lucide-react` but never used in the homepage JSX (it's used by Navigation/Footer which import it themselves).

**Fix:** Remove `Leaf` from the import statement on line 7.

---

### 3. Lazy-Load `AuthProvider` for Non-Admin Users (Significant)

**File:** `src/App.tsx`

The `AuthProvider` wraps the entire app and runs `supabase.auth.getSession()` + `supabase.auth.onAuthStateChange()` on **every page load for every user**, even though authentication is only needed for admin routes (`/admin/*`) and preview routes (`/preview/*`).

This means:
- The Supabase Auth JS module is loaded for all users
- An unnecessary network request to check auth session fires on every visit
- The `user_roles` table query runs if a session exists

**Fix:** Move `AuthProvider` to only wrap admin and preview routes. Create a lightweight `AdminLayout` wrapper that includes `AuthProvider`, and keep the public routes without it. This avoids loading auth code and making auth API calls for regular visitors.

---

### 4. Lazy-Load `CartDrawer` Component (Moderate)

**File:** `src/App.tsx` (line 10, and in `RootLayout`)

`CartDrawer` is imported eagerly and rendered in `RootLayout` for every route, including admin routes and pages where users never interact with the cart. The component includes `Sheet`, `ScrollArea`, and `Separator` UI components.

While the `CartContext` itself is lightweight (just state management), the `CartDrawer` component with its UI imports adds unnecessary JS to the initial bundle.

**Fix:** Lazy-load `CartDrawer` using `React.lazy()` so it only loads when the cart is first opened, or conditionally render it only on public routes.

---

### 5. Replace `react-helmet` with Lighter Alternative (Significant but Risky)

`react-helmet` (6.1KB gzipped) is used across 15+ pages. It's a relatively heavy library for simply setting `<title>` and `<meta>` tags. A lighter approach would use `document.title` and direct DOM manipulation, or the newer `react-helmet-async` which is tree-shakeable.

**Recommendation:** Skip this for now -- it's used everywhere and the risk/reward ratio is poor. The 6KB is spread across lazy-loaded pages anyway.

---

### Implementation Plan

| Priority | Change | Impact | Risk |
|----------|--------|--------|------|
| 1 | Remove unused `date-fns` imports from Index.tsx | ~16KB saved | None |
| 2 | Remove unused `Leaf` icon from Index.tsx | Minor tree-shake improvement | None |
| 3 | Scope `AuthProvider` to admin/preview routes only | Removes auth API call + auth JS for public users | Low - need to ensure admin routes still work |
| 4 | Lazy-load `CartDrawer` | Defers Sheet/ScrollArea/Separator JS | Low |

### Files Changed

1. `src/pages/Index.tsx` -- Remove unused `date-fns` and `Leaf` imports
2. `src/App.tsx` -- Restructure providers: scope `AuthProvider` to admin/preview routes, lazy-load `CartDrawer`

