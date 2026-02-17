

## Fix: Contact Info Sidebar Email Still Wrapping

### Problem

The sidebar column occupies only 1/3 of the grid (`lg:grid-cols-3`). After subtracting the icon (40px) and spacing (16px), only ~300px remains for text. The email "verdedoro.microgreens@gmail.com" is too long to fit in that space at the default font size, so it still wraps the final "m" to a new line.

Changing `break-all` to `break-words` did not help because the entire email address is treated as a single "word" by `break-words`, so it still breaks at the container edge.

### Solution

Two complementary changes:

1. **Reduce the details text size to `text-sm`** -- this makes the email fit within the available width on most screen sizes without wrapping
2. **Keep `break-words`** as a safety net for extremely narrow viewports

### Changes

**File: `src/pages/Contatti.tsx`** (line 418)

```
// BEFORE:
<p className="font-body text-foreground break-words">

// AFTER:
<p className="font-body text-sm text-foreground break-words">
```

**File: `src/pages/preview/ContattiPreview.tsx`** (line 327)

Same change for the preview page.

### Why This Works

At `text-sm` (14px / 0.875rem), the email "verdedoro.microgreens@gmail.com" fits within ~280px, which is well within the available space in the sidebar. The `break-words` remains as a fallback for very small screens.
