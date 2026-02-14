

## Fix "Aggiungi al Carrello" Button Overflow on Mobile

### Problem
On mobile, the ShoppingCart icon appears outside the button's left edge, and the button text + price can overflow. The icon and text together exceed the available width inside the button.

### Root Cause
The button uses `gap-2` (from buttonVariants base) plus `mr-2` on the icon, creating double spacing. Combined with `text-base` and the price text, it overflows on narrow screens.

### Solution
**File: `src/pages/ProductDetail.tsx`** (lines 343-352)

1. Remove `mr-2` from the ShoppingCart icon (the button already has `gap-2` from its variant)
2. Add `truncate` to prevent text overflow, and reduce icon size to `h-4 w-4` to match the variant's `[&_svg]:size-4`
3. Add `min-w-0` to ensure the button content can shrink

Updated button:
```tsx
<Button 
  variant="oro" 
  size="lg" 
  className="w-full h-12 text-sm sm:text-base font-semibold mb-4 shadow-oro hover:shadow-oro/50 transition-all duration-300" 
  onClick={handleAddToCart}
>
  <ShoppingCart className="h-4 w-4 shrink-0" />
  <span className="truncate">
    Aggiungi al Carrello
    {currentPrice !== undefined && currentPrice > 0 && ` - ${formatPrice(currentPrice)}`}
  </span>
</Button>
```

Changes:
- Remove `mr-2` from icon (button's built-in `gap-2` handles spacing)
- Add `shrink-0` to icon so it never gets compressed
- Wrap text in `<span className="truncate">` to prevent overflow
- Use `text-sm sm:text-base` for slightly smaller text on mobile
- These changes ensure the icon stays inside the button and text fits on all screen widths

