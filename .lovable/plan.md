

# Precise Text Alignment for Navigation Dropdown

## Goal
Align the first letter of each dropdown item with the first letter of "Microgreens" in the nav bar, creating a clean vertical text line.

## How It Works

The trigger text "Microgreens" has `px-0` padding, so its text starts at the left edge of the NavigationMenuItem. The dropdown currently uses `left-1/2 -translate-x-1/2` centering on the viewport, which misaligns the text.

The fix:
1. Position the dropdown to start at `left-0` relative to the trigger item (not centered)
2. Remove all left padding from dropdown items so text starts flush
3. Offset the dropdown container slightly left (negative margin) to compensate for the viewport border, so the actual text inside lines up with the trigger text

## Changes

### 1. `src/components/ui/navigation-menu.tsx` (viewport positioning)
- Change viewport from `left-1/2 -translate-x-1/2` back to `left-0` so the dropdown anchors to the left edge of its parent trigger item

### 2. `src/components/Navigation.tsx` (dropdown content)
- Remove `p-2` from the `<ul>` container -- use `py-2 pl-0 pr-2` instead so the left side has zero padding
- Change dropdown item padding from `px-3` to `pl-0 pr-3` so text starts flush left
- Increase text size from `text-sm` to `text-[0.95rem]` (slightly bigger as requested)
- For the active state border-l indicator, switch to a different approach: use a left pseudo-element or just a background highlight so the border doesn't push text alignment off
- Set dropdown width to `w-[280px]` to accommodate slightly larger text

### 3. Active state adjustment
- Replace `border-l-2 border-oro-primary` (which shifts text by 2px) with an underline or background-only indicator to maintain perfect alignment
- Use a subtle `bg-secondary/60` background with a small colored dot or bold text weight as the active indicator instead

## Technical Details

**navigation-menu.tsx line 80:**
```
// FROM:
"absolute left-1/2 top-full -translate-x-1/2 flex justify-center"
// TO:
"absolute left-0 top-full flex justify-center"
```

**Navigation.tsx line 260 (ul container):**
```
// FROM:
"grid w-[260px] gap-0.5 p-2"
// TO:
"grid w-[280px] gap-0.5 py-2 pr-2"
```

**Navigation.tsx lines 267-271 (item links):**
```
// FROM:
"block select-none rounded-md px-3 py-2.5 text-sm leading-none ..."
// Active: "bg-secondary/60 text-foreground font-medium border-l-2 border-oro-primary"

// TO:
"block select-none rounded-r-md py-2.5 pl-0 pr-3 text-[0.95rem] leading-none ..."
// Active: "text-foreground font-semibold" (bold weight as indicator, no border-l)
// Inactive: "text-muted-foreground"
```

This ensures every dropdown item's first character sits on the exact same vertical line as the "M" in "Microgreens".
