
# Remove Auto-Open Cart Drawer on Add

## What Changes

Only one small change is needed in `src/contexts/CartContext.tsx`: remove the `openCart()` call in the `addItem` function (line 59).

The cart badge shake animation (`animate-cart-shake`) is already implemented and working -- it triggers whenever `lastAddedTimestamp` updates, which happens on every add. So after removing the auto-open, the user will see:
- The cart icon badge shakes and scales up briefly (0.6s)
- The item count updates in the badge

No other files need changes.

## Technical Details

**File: `src/contexts/CartContext.tsx`**

Remove lines 58-59:
```typescript
// Open cart drawer to confirm the addition
openCart();
```

Keep only the badge animation trigger (`setLastAddedTimestamp(Date.now())`).
