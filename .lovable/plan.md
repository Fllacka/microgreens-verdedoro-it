
## Fix: Button Text Truncated on Mobile

### Root Cause
Two things combine to truncate the text:
1. The button component's base class includes `whitespace-nowrap` (line 8 of `button.tsx`)
2. We added `truncate` to the text span, which adds `text-overflow: ellipsis`

### Solution
**File: `src/pages/ProductDetail.tsx`** (lines 343-354)

- Remove `truncate` from the text span (it was causing the ellipsis)
- Add `whitespace-normal` to the button className to override the base `whitespace-nowrap`
- This lets the button text wrap to two lines on narrow screens while staying single-line on desktop

```tsx
<Button 
  variant="oro" 
  size="lg" 
  className="w-full h-auto min-h-[48px] text-sm sm:text-base font-semibold mb-4 shadow-oro hover:shadow-oro/50 transition-all duration-300 whitespace-normal" 
  onClick={handleAddToCart}
>
  <ShoppingCart className="h-4 w-4 shrink-0" />
  <span>
    Aggiungi al Carrello
    {currentPrice !== undefined && currentPrice > 0 && ` - ${formatPrice(currentPrice)}`}
  </span>
</Button>
```

Changes:
- `whitespace-normal` overrides button's built-in `whitespace-nowrap`, allowing text to wrap
- `h-auto min-h-[48px]` replaces fixed `h-12` so the button can grow taller if text wraps
- Removed `truncate` from the span so no ellipsis is applied

No other files need to change.
