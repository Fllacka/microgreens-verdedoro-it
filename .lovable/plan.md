

# Dropdown Box Padding with Text Alignment

## Goal
Keep dropdown text aligned with "M" of "Microgreens", but extend the dropdown **box** to the left to create balanced padding around the text.

## Approach
Use a negative left margin on the viewport container to shift the box left, then add equal left padding inside the dropdown items so the text stays aligned with "Microgreens".

Think of it like this:
- The box moves 16px to the left (negative margin)
- The text inside gets 16px left padding (cancels out)
- Net result: text stays aligned, box has padding on both sides

## Changes

### 1. `src/components/ui/navigation-menu.tsx` (line 80)
- Add `-ml-4` to the viewport wrapper div so the dropdown box extends 16px to the left of the text alignment point

### 2. `src/components/Navigation.tsx` (lines 260, 267)
- On the `ul` container (line 260): add `pl-4` left padding to offset the text back to the right, matching the negative margin
- On each dropdown link (line 267): change `pl-0` to `pl-4` so text has left padding that compensates for the box shift
- Keep `pr-3` (or increase to `pr-4` for symmetry)

### Result
```
         Microgreens v
         |
    +----|------------------+
    |    |                  |
    |    I nostri microgreens|
    |    |                  |
    |    Cosa sono i micro..|
    |    |                  |
    +---------------------------+
    ^    ^
    box  text aligns with "M"
```

The box has ~16px padding on both left and right of the text, while the text's first letter remains vertically aligned with "Microgreens".

