# Project Context

- **Owner:** Zack Way
- **Project:** RecipeHub — a full-stack recipe management app built with .NET Aspire 13.2. .NET 10 Minimal API backend with EF Core 10 + SQLite. React 19 + TypeScript + Vite 6 frontend with TanStack Query v5. Aspire dashboard for observability. Built for the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET 10, Aspire 13.2, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit
- **Created:** 2026-05-27

## Learnings

### 2026-05-27: Systemic WCAG 2.2 Audit (Issue #1)

**Context:** User feedback after PR #5: "the UI Accessibility is still broken, so many buttons that can't be read and a lot of text with bad visibility. No way this would pass WCAG 2.2." PR #5 applied Cook Mode-only fixes. This audit scoped the full frontend for systemic violations.

**🚨 CRITICAL DISCOVERY — Dark Mode CSS Inheritance Failure:**
Screenshot evidence (`copilot-image-1692f6.png`) revealed Cook Mode instruction card has **white text on white background** when user enables OS dark mode. Root cause: Browser automatically flips CSS custom properties in `:root` (e.g., `--color-text-primary: #1a1a1a` becomes `#ffffff` in dark mode). Light containers (cards, forms) that use `color: var(--color-text-primary)` on light backgrounds inherit **white-on-white text** = complete WCAG failure (< 1.1:1 contrast).

**Systemic Pattern:** Light containers must **explicitly set foreground color** and cannot rely on inherited CSS variables subject to browser dark mode auto-conversion. Every component using `color: var(--color-text-primary)` on light backgrounds fails when user enables dark mode.

**Fix Options:**
1. **Short-term:** Set `color-scheme: only light` in `:root` to disable browser dark mode auto-conversion
2. **Medium-term:** Add explicit `@media (prefers-color-scheme: dark)` overrides with separate tokens for `--color-text-on-light-bg` vs `--color-text-on-dark-bg`
3. **Long-term:** Replace CSS variables with explicit color values on all light background containers

**Critical Findings:**
1. **Metadata text contrast failures:** `#4a4a4a` used across 9+ locations provides only 2.95:1 contrast (requires 4.5:1). Minimum compliant: `#5a5a5a`.
2. **Error text contrast failures:** `#a33` used across 6+ locations provides only 3.85:1 contrast. Minimum compliant: `#923`.
3. **Form validation ARIA missing:** RecipeEditPage shows errors as sibling elements without `aria-describedby` or `role="alert"`. Screen readers cannot announce validation failures.
4. **Focus indicators missing:** SearchBar clear button and form inputs lack `:focus-visible` styles. Keyboard users have no visual feedback.
5. **Touch target sizing:** SearchBar clear button (~20px width) and FilterPanel chips (~20px height) fail 24×24px minimum.
6. **Disabled button opacity:** Primary/danger buttons at `opacity: 0.65` drop below 3:1 UI component contrast threshold.

**Scope:** All pages (Home, RecipeList, RecipeDetail, RecipeEdit, Favorites, CookMode), all shared components (Button, Card, Badge, SearchBar, FilterPanel, Spinner, ShareButton).

**Deliverable:** `.squad/decisions/inbox/cartman-systemic-wcag22-scope.md` — comprehensive implementation guardrails for Kenny with priority checklist.

**Architecture Insight:** CSS color values scattered across 15+ module.css files with no shared design tokens. Future work should centralize color palette in CSS variables (e.g., `--color-text-meta`, `--color-error`, `--focus-ring`) to prevent drift and ensure WCAG compliance at the token level. **CRITICAL:** CSS variables must be protected from browser dark mode auto-conversion via explicit `@media (prefers-color-scheme: dark)` overrides or by disabling dark mode entirely with `color-scheme: only light`.

**Gated by:** Kyle will verify WCAG compliance post-implementation using WebAIM Contrast Checker, keyboard navigation, screen reader testing (NVDA/JAWS), touch target sizing at 375px viewport, **and dark mode testing** (OS dark mode enabled).

<!-- Append new learnings below. Each entry is something lasting about the project. -->
