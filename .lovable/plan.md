
# Fix: Navigation Dropdown Styling and Alignment

## Problem
The "Microgreens" dropdown menu has visual issues:
- The active item ("I nostri microgreens") has a solid gold/yellow background that looks heavy and misaligned
- The dropdown border and shadow feel slightly off from the rest of the design
- The overall dropdown alignment and spacing could be cleaner

## Changes

### 1. `src/components/Navigation.tsx` (lines 259-279)
- Remove the heavy `bg-accent` active state and replace it with a subtler left-border accent style
- Clean up padding and spacing for better alignment
- Use a softer active indicator (e.g., left border in oro-primary + subtle background) instead of the full gold highlight

### 2. `src/components/ui/navigation-menu.tsx` (line 80-89)
- Adjust the viewport container positioning to center it better under the trigger
- Clean up border radius and shadow for a more polished look

## Details

**Dropdown item styling (Navigation.tsx):**
- Active state: change from `bg-accent text-accent-foreground` to a subtle `bg-secondary/60 border-l-2 border-oro-primary` for elegance
- Hover state: keep `hover:bg-accent` but ensure smooth transitions
- Increase padding slightly for better touch targets and readability

**Viewport alignment (navigation-menu.tsx):**
- Change viewport wrapper from `left-0` to centering logic so the dropdown aligns under the trigger text
- Ensure `bg-popover` renders a solid white background (no transparency)
