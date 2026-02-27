

## Plan: Convert ProductCard from `<div onClick>` to `<Link>` for SEO

### Problem
ProductCard renders a `<div>` with an `onClick` handler using `navigate()`. Crawlers cannot discover product URLs because there's no `<a href>` in the HTML.

### Changes

#### 1. Update `ProductCard` component (`src/components/ProductCard.tsx`)
- Replace `onCardClick` prop with `slug: string`
- Wrap the entire card in `<Link to={/microgreens/${slug}}>` from react-router-dom
- Remove `onClick` and `cursor-pointer` from the Card div
- The `<Link>` renders as a real `<a href="/microgreens/slug">` in HTML

#### 2. Update all 8 consumer files to pass `slug` instead of `onCardClick`
Replace `onCardClick={() => navigate(`/microgreens/${product.slug}`)}` with `slug={product.slug}` in:
- `src/pages/Index.tsx`
- `src/pages/Microgreens.tsx`
- `src/pages/BlogArticle.tsx`
- `src/pages/CosaSonoMicrogreens.tsx`
- `src/pages/ProductDetail.tsx`
- `src/pages/preview/MicrogreensPreview.tsx`
- `src/pages/preview/BlogPreview.tsx`
- `src/pages/preview/CosaSonoMicrogreensPreview.tsx`

Each file: remove the `onCardClick` prop, add `slug={product.slug}`, and clean up unused `useNavigate` imports if no longer needed.

