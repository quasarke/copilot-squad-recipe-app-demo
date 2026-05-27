# Cook Mode Accessibility Standards

**Domain:** Frontend accessibility patterns

**Decision:** Established WCAG 2.2 Level AA compliance patterns for Cook Mode and set precedent for future frontend accessibility work.

## Patterns Established

### Color Contrast
- Links on white: Use `#1d4ed8` or darker (meets 4.5:1 ratio for normal text)
- Error messages: `#991b1b` text with `#fef2f2` background and `#fca5a5` border
- Warning/timer elements: `#d97706` border with `#fef3c7` background
- Borders/separators: Use `#d1d5db` minimum for visible definition

### Focus States
- All interactive elements: `focus-visible` with `2px solid #2563eb` outline, `2px` offset
- Links need explicit focus styles — browser defaults aren't sufficient

### Disabled States
- Combine `opacity: 0.65` with `filter: grayscale(0.3)` to maintain contrast while showing disabled state
- Never rely on opacity alone — can drop contrast below WCAG minimums

### ARIA Patterns
- Error messages: Always include `role="alert"` for immediate screen reader announcement
- Timers: Use `role="timer"` on container, `aria-atomic="true"` on the display value
- Buttons: Add descriptive `aria-label` when context isn't obvious from button text alone
- Navigation: Use `aria-label` on nav elements and contextual labels on directional buttons

## Rationale

Accessibility isn't optional — it's a baseline requirement. These patterns ensure users with visual impairments, motor disabilities, or screen readers can fully use Cook Mode. Establishing consistent patterns now prevents technical debt and ensures new features start accessible.

## Impact

- Cook Mode now meets WCAG 2.2 Level AA
- Sets precedent for all new frontend components
- Provides reusable patterns for other pages (RecipeList, RecipeDetail, Favorites)

## Owner

Kenny

**Related:** Issue #1, PR #5
