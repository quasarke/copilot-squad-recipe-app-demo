---
name: "frontend-accessibility-testing"
description: "WCAG 2.2 accessibility testing patterns for React frontends"
domain: "testing, accessibility, wcag"
confidence: "high"
source: "earned"
---

## Context

When auditing or testing React frontend components for accessibility, apply WCAG 2.2 Level AA guidelines with focus on:
- Color contrast (1.4.3 — 4.5:1 for text, 3:1 for UI components)
- Touch target size (2.5.8 — minimum 24×24px)
- Keyboard navigation and focus management (2.1.1, 2.4.7)
- Screen reader announcements (ARIA live regions, semantic HTML)
- Error states and dynamic content (4.1.3)

This skill applies to all frontend UI work, especially user-facing pages with interactive elements or time-sensitive operations (forms, wizards, timers, step navigation).

## Patterns

### 1. Contrast Verification

Use browser DevTools Accessibility panel or automated tools (Lighthouse, axe-core):
- **Text**: 4.5:1 contrast ratio for normal text, 3:1 for large text (18pt+ or 14pt+ bold)
- **UI Components**: 3:1 for non-text elements (borders, icons, focus indicators)
- Test against actual rendered background, not assumed white

### 2. Touch Target Sizing

WCAG 2.2 Level AA requires minimum 24×24px effective clickable area:
- Test in responsive mode (375px viewport width minimum)
- Buttons with small padding may need increased touch area via padding or wrapper
- Links in body text need adequate padding or inline-block treatment

### 3. Focus Styles

All interactive elements must have visible focus indicator:
- Use `:focus-visible` (not `:focus`) to avoid mouse-click noise
- Minimum 2px outline with contrast against background and element
- Maintain consistent focus treatment across all controls (buttons, links, inputs)

### 4. Keyboard Navigation

Tab order must follow visual order:
- No keyboard traps (user can escape all UI)
- Skip links for long navigation blocks
- Modals trap focus until dismissed
- Custom widgets (dropdowns, accordions) follow ARIA Authoring Practices Guide patterns

### 5. ARIA Live Regions & Announcements

For dynamic content changes:
- **Status updates**: `aria-live="polite"` (e.g., loading states, timers, validation feedback)
- **Errors/alerts**: `role="alert"` or `aria-live="assertive"` (e.g., form errors, critical failures)
- **Step/page transitions**: Either `aria-live="polite"` on heading or programmatic focus management
- **Loading states**: `role="status"` with visually hidden label

### 6. Semantic HTML First

Prefer native HTML over ARIA:
- `<button>` over `<div role="button">`
- `<nav>`, `<main>`, `<article>`, `<section>` for landmarks
- `<h1>`-`<h6>` for heading hierarchy
- `aria-label` or `aria-labelledby` for navigation landmarks with multiple instances

### 7. Error State Accessibility

Error messages must be:
- Programmatically associated with inputs (`aria-describedby` or `aria-errormessage`)
- Announced to screen readers (`role="alert"` or `aria-live="assertive"`)
- Distinguishable by more than color alone (icon, text, border)

## Examples

### Good: Accessible Button with Loading State

```tsx
<button
  disabled={isLoading}
  aria-busy={isLoading || undefined}
>
  {isLoading && <span aria-hidden="true">⏳</span>}
  <span>Submit</span>
</button>
```

### Good: Accessible Timer with Context

```tsx
<div aria-live="polite" aria-atomic="true">
  <span className="sr-only">
    {isRunning ? 'Timer running:' : 'Timer paused:'}
  </span>
  <span className="timer-display">{formatTime(seconds)}</span>
</div>
<button onClick={toggle} aria-label={isRunning ? 'Pause timer' : 'Start 5-minute timer'}>
  {isRunning ? 'Pause' : 'Start'}
</button>
```

### Good: Error State

```tsx
{error && (
  <div role="alert" className="error-message">
    <span aria-hidden="true">⚠️</span>
    {error.message}
  </div>
)}
```

### Bad: Color-Only Error

```tsx
{/* FAIL: No semantic structure, no announcement, color-only */}
{error && <div style={{color: 'red'}}>{error.message}</div>}
```

### Good: Focus Style

```css
.link:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
}
```

### Bad: Focus Style Removed

```css
.link:focus {
  outline: none; /* FAIL: keyboard users lose focus indicator */
}
```

## Anti-Patterns

1. **Removing focus outlines**: Never use `outline: none` without a replacement `:focus-visible` style
2. **Color-only indicators**: Errors, warnings, status must use text/icons, not color alone
3. **Generic ARIA labels**: `aria-label="button"` is useless — describe the action
4. **Missing live regions**: Dynamic content changes (e.g., "Step 2 of 5") must announce to screen readers
5. **Tiny touch targets**: Buttons with < 24×24px effective area fail mobile accessibility
6. **Keyboard traps**: Modals, dropdowns, custom widgets must allow escape (Esc key, focus cycling)
7. **Orphaned ARIA**: Using `aria-describedby` referencing a non-existent ID fails validation
8. **Opacity-only disabled states**: Using `opacity < 0.65` alone can drop contrast below WCAG minimums — combine with grayscale filter

## Implementation Patterns (RecipeHub Project)

### Cook Mode Accessibility Pattern (src/RecipeHub.Web/src/pages/CookModePage.tsx)

Comprehensive example of WCAG 2.2 compliance:

**Color Palette:**
- Primary link: `#1d4ed8` (meets 4.5:1 on white)
- Error text: `#991b1b` on `#fef2f2` background with `#fca5a5` border
- Warning/timer: `#d97706` border on `#fef3c7` background
- Borders: `#d1d5db` minimum

**Timer Component:**
```tsx
<div role="timer" aria-label={`Recipe step timer, ${minutes} minutes`}>
  <span aria-live="polite" aria-atomic="true">
    {formatSeconds(remainingSeconds)}
  </span>
  <Button onClick={start} disabled={remainingSeconds === 0} 
    aria-label={remainingSeconds === 0 ? 'Timer finished' : 'Start timer'}>
    Start
  </Button>
  <Button onClick={pause} aria-label="Pause timer">Pause</Button>
  <Button onClick={reset} aria-label="Reset timer">Reset</Button>
</div>
```

**Error States:**
```tsx
<div className={styles.error} role="alert">
  Couldn't load cook mode. {error instanceof Error ? error.message : ''}
</div>
```

**Navigation Context:**
```tsx
<nav aria-label="Step navigation">
  <Button onClick={prev} disabled={!canPrev} aria-label="Previous step">
    Previous
  </Button>
  <Button onClick={next} disabled={!canNext} 
    aria-label={canNext ? 'Next step' : 'Last step - return to recipe'}>
    Next
  </Button>
</nav>
```

**Focus Styles (CookModePage.module.css):**
```css
.back:focus-visible {
  outline: 2px solid #2563eb;
  outline-offset: 2px;
  border-radius: 2px;
}
```

**Disabled Button Styles (Button.module.css):**
```css
.button:disabled {
  cursor: not-allowed;
  opacity: 0.65;
  filter: grayscale(0.3); /* Maintains contrast while showing disabled state */
}
```

## Testing Checklist Template

For any interactive UI feature, verify:

- [ ] **CON**: All text meets 4.5:1 contrast, UI elements 3:1
- [ ] **TGT**: All interactive elements ≥ 24×24px effective touch area
- [ ] **FOC**: Visible focus indicator on all interactive elements
- [ ] **KEY**: Full keyboard navigation without traps
- [ ] **ARIA**: Dynamic content changes announced (live regions)
- [ ] **SEM**: Semantic HTML used (landmarks, headings, buttons)
- [ ] **ERR**: Error states use `role="alert"` and non-color indicators
- [ ] **SR**: Screen reader testing with NVDA/JAWS/VoiceOver

## Automated Testing Integration

Add to Vitest setup (future):

```typescript
import { axe, toHaveNoViolations } from 'vitest-axe';
expect.extend(toHaveNoViolations);

it('has no accessibility violations', async () => {
  const { container } = render(<CookModePage />);
  const results = await axe(container);
  expect(results).toHaveNoViolations();
});
```

## References

- WCAG 2.2: https://www.w3.org/WAI/WCAG22/quickref/
- ARIA Authoring Practices: https://www.w3.org/WAI/ARIA/apg/
- WebAIM Contrast Checker: https://webaim.org/resources/contrastchecker/
- axe DevTools: Browser extension for automated checks
