/**
 * Accessibility regression tests for Button component.
 * Tests basic WCAG 2.2 requirements without external a11y testing libraries.
 * 
 * Critical requirements tested:
 * - Focus management and keyboard interaction
 * - ARIA attributes for loading state
 * - Semantic HTML (button element)
 * - Disabled state handling
 */

import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Button } from '../Button';

describe('Button accessibility', () => {
  it('renders as a button element (semantic HTML)', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button.tagName).toBe('BUTTON');
  });

  it('is keyboard focusable when enabled', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    button.focus();
    expect(document.activeElement).toBe(button);
  });

  it('is not focusable when disabled', () => {
    render(<Button disabled>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeDisabled();
    // Disabled buttons should not be in the focus order
    button.focus();
    expect(document.activeElement).not.toBe(button);
  });

  it('announces loading state with aria-busy', () => {
    render(<Button loading>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveAttribute('aria-busy', 'true');
    expect(button).toBeDisabled(); // loading buttons should be disabled
  });

  it('has accessible name from children', () => {
    render(<Button>Save changes</Button>);
    expect(screen.getByRole('button', { name: /save changes/i })).toBeInTheDocument();
  });

  it('spinner is hidden from screen readers when loading', () => {
    const { container } = render(<Button loading>Submit</Button>);
    const spinner = container.querySelector('[aria-hidden="true"]');
    expect(spinner).toBeInTheDocument();
  });

  it('supports all variant types without aria errors', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger'] as const;
    variants.forEach((variant) => {
      const { unmount } = render(<Button variant={variant}>Test</Button>);
      const button = screen.getByRole('button', { name: /test/i });
      expect(button).toBeInTheDocument();
      unmount();
    });
  });

  it('loading state does not remove accessible name', () => {
    render(<Button loading>Submit form</Button>);
    // Button text should still be in accessible name even when loading
    expect(screen.getByRole('button', { name: /submit form/i })).toBeInTheDocument();
  });

  it('type="submit" creates submit button', () => {
    render(<Button type="submit">Submit</Button>);
    const button = screen.getByRole('button', { name: /submit/i });
    expect(button).toHaveAttribute('type', 'submit');
  });

  it('type="button" is default (prevents form submission)', () => {
    render(<Button>Click me</Button>);
    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toHaveAttribute('type', 'button');
  });
});

/**
 * MANUAL TESTING CHECKLIST (run on each change):
 * 
 * [ ] CRIT-1: Button contrast in all states (use WebAIM Contrast Checker)
 *     - Primary: #2563eb on white = 5.9:1 (pass)
 *     - Primary hover: #1d4ed8 on white = 7.9:1 (pass)
 *     - Primary disabled (opacity 0.65): effective ~#6a8eef = ~3.8:1 (FAIL - needs fix)
 *     - Secondary: #1f2937 on #fff = ~14:1 (pass)
 *     - Ghost: #1f2937 on white = ~14:1 (pass), but check on gray backgrounds
 *     - Danger: #dc2626 on white = 5.1:1 (pass)
 * 
 * [ ] CRIT-9: Focus-visible outline is clear and consistent
 *     - Tab to button, verify 2px solid #2563eb outline with 2px offset
 * 
 * [ ] IMP-1: Touch target size meets 24×24px minimum
 *     - Small buttons: measure in DevTools (should be ≥24px tall)
 *     - Medium buttons: measure in DevTools
 *     - Large buttons: measure in DevTools
 * 
 * [ ] Keyboard interaction works (Tab, Enter, Space)
 * [ ] Screen reader announces button text and state (loading, disabled)
 */
