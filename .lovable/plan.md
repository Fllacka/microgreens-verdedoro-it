

## Fix Product Detail Mobile Overflow

### Problem
On mobile, the product info section (title, description, purchase card) overflows the viewport width, causing text truncation and a horizontal scrollbar. The grid children don't constrain their width properly.

### Root Cause
The grid column containing product info (`div.flex.flex-col`) lacks `min-w-0`, which is required for flex/grid children to shrink below their content's intrinsic width. Without it, long text pushes the container wider than the viewport.

### Solution
Add `min-w-0` to both grid children (image and info columns) so they respect the grid's column boundaries and don't overflow.

### Technical Detail

**File: `src/pages/ProductDetail.tsx`**

1. **Line 275** - Image column: add `min-w-0`
```
Before: <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-square">
After:  <div className="relative rounded-2xl overflow-hidden shadow-xl aspect-square min-w-0">
```

2. **Line 287** - Info column: add `min-w-0`
```
Before: <div className="flex flex-col justify-start md:sticky md:top-24 md:self-start">
After:  <div className="flex flex-col justify-start md:sticky md:top-24 md:self-start min-w-0">
```

3. **Line 246** - Section: add `overflow-hidden` as safety net
```
Before: <section className="container mx-auto px-4 py-12">
After:  <section className="container mx-auto px-4 py-12 overflow-hidden">
```

These three small class additions will prevent any content from exceeding the viewport width on mobile.

