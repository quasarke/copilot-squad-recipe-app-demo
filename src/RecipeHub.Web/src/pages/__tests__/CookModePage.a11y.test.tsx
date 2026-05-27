/**
 * Accessibility regression guard for Cook Mode.
 * 
 * IMPORTANT: This test checks component structure and ARIA attributes but CANNOT
 * verify actual rendered contrast. Visual verification with browser testing is
 * still MANDATORY per REGR-1 in the WCAG 2.2 gate.
 * 
 * REGR-1: Screenshot copilot-image-1692f6.png shows white-on-white text in Cook Mode.
 * This test catches structural issues but not rendering failures.
 */

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { CookModePage } from '../CookModePage';

// Mock the hooks
vi.mock('../../hooks', () => ({
  useCookMode: vi.fn(() => ({
    step: {
      instruction: 'Whisk flour, sugar, baking powder, baking soda, and salt in a large bowl.',
      timerMinutes: null,
      totalSteps: 5,
    },
    isLoading: false,
    error: null,
    next: vi.fn(),
    prev: vi.fn(),
    canNext: true,
    canPrev: false,
    currentStep: 1,
  })),
  useTimer: vi.fn(() => ({
    remainingSeconds: 0,
    isRunning: false,
    start: vi.fn(),
    pause: vi.fn(),
    reset: vi.fn(),
  })),
}));

function createWrapper() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>
      <MemoryRouter initialEntries={['/recipes/1/cook']}>
        <Routes>
          <Route path="/recipes/:id/cook" element={children} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('CookModePage accessibility (REGR-1 guard)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders instruction text in a semantic section', () => {
    const Wrapper = createWrapper();
    render(<CookModePage />, { wrapper: Wrapper });

    const instruction = screen.getByText(
      /Whisk flour, sugar, baking powder, baking soda, and salt in a large bowl/i
    );
    expect(instruction).toBeInTheDocument();
    expect(instruction.tagName).toBe('P');
  });

  it('step heading has aria-live for announcements (STEP-1)', () => {
    const Wrapper = createWrapper();
    render(<CookModePage />, { wrapper: Wrapper });

    const heading = screen.getByRole('heading', { name: /Step 1 of 5/i });
    expect(heading).toHaveAttribute('aria-live', 'polite');
  });

  it('navigation buttons have accessible labels', () => {
    const Wrapper = createWrapper();
    render(<CookModePage />, { wrapper: Wrapper });

    expect(screen.getByRole('button', { name: /Previous step/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Next step/i })).toBeInTheDocument();
  });

  it('back link exists and has accessible name (TGT-1)', () => {
    const Wrapper = createWrapper();
    render(<CookModePage />, { wrapper: Wrapper });

    const backLink = screen.getByRole('link', { name: /Back to recipe/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink.className).toContain('back');
  });

  it('instruction section exists with expected structure', () => {
    const Wrapper = createWrapper();
    const { container } = render(<CookModePage />, { wrapper: Wrapper });

    const sections = container.querySelectorAll('section');
    const instructionSection = Array.from(sections).find((section) =>
      section.textContent?.includes('Whisk flour')
    );

    expect(instructionSection).toBeDefined();
    expect(instructionSection?.querySelector('p')).toBeDefined();
  });

  it('renders without errors when no timer is present', () => {
    const Wrapper = createWrapper();
    render(<CookModePage />, { wrapper: Wrapper });

    expect(screen.queryByRole('timer')).not.toBeInTheDocument();
  });
});

/**
 * MANUAL TESTING CHECKLIST (MANDATORY per REGR-1):
 * 
 * [ ] REGR-1: Cook Mode instruction text contrast
 *     - Open Cook Mode in browser with OS dark mode ENABLED
 *     - Verify instruction text is clearly readable (not white-on-white)
 *     - Use WebAIM Contrast Checker on RENDERED text (not CSS source)
 *     - Test in: light mode, OS dark mode, Windows High Contrast
 *     - Minimum 4.5:1 contrast ratio
 * 
 * [ ] Screenshot evidence required in PR
 *     - Light mode: instruction text visible
 *     - OS dark mode: instruction text visible
 *     - Include contrast measurements
 * 
 * [ ] If instruction text is unreadable in ANY mode, PR is BLOCKED
 * 
 * IMPORTANT: This automated test does NOT catch the REGR-1 rendering failure.
 * Visual verification is MANDATORY. CSS inspection is insufficient.
 */
