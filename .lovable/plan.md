

## Fix: Email Text Breaking Incorrectly in Contact Info

### Problem

The email address "verdedoro.microgreens@gmail.com" in the contact info sidebar is using `break-all` CSS, which breaks the text at **any** character boundary. This causes the last "m" to be pushed to a new line even when there's enough space to fit more characters.

### Solution

Replace `break-all` with `break-words` (Tailwind class) on the contact info details text. This uses `overflow-wrap: break-word` instead of `word-break: break-all`, meaning it will only break mid-word when the entire word doesn't fit -- preserving natural text flow while still preventing horizontal overflow on very narrow screens.

### Changes

**File: `src/pages/Contatti.tsx`** (line 418)

```
// BEFORE:
<p className="font-body text-foreground break-all">

// AFTER:
<p className="font-body text-foreground break-words">
```

**File: `src/pages/preview/ContattiPreview.tsx`**

Apply the same fix to the preview version of the contact info rendering for consistency.

### Why This Works

- `break-all`: breaks at any character, even when unnecessary (current behavior causing the bug)
- `break-words`: only breaks mid-word when the word is too long for its container (correct behavior)

Both prevent overflow on mobile, but `break-words` preserves natural reading flow on wider screens.

