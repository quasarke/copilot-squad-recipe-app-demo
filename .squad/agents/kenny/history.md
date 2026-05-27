# Project Context

- **Owner:** Zack Way
- **Project:** RecipeHub — a full-stack recipe management app built with .NET Aspire 13.2. .NET 10 Minimal API backend with EF Core 10 + SQLite. React 19 + TypeScript + Vite 6 frontend with TanStack Query v5. Aspire dashboard for observability. Built for the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET 10, Aspire 13.2, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit
- **Created:** 2026-05-27

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- 2026-05-27: Favorites now follow the shared frontend data flow: API methods live in `src/RecipeHub.Web/src/api/client.ts`, query keys in `src/RecipeHub.Web/src/hooks/queryKeys.ts`, and TanStack Query wrappers in `src/RecipeHub.Web/src/hooks/useFavorites.ts`.
- 2026-05-27: Until auth exists, the frontend favorites flow hardcodes `default-user` in the shared API client so pages and hooks do not thread user IDs through components. The backend also supports default-user fallback, creating a stable seam for eventual auth swap.
- 2026-05-27: Favorites UI lives in `src/RecipeHub.Web/src/pages/FavoritesPage.tsx` as clickable recipe cards with nested remove actions that stop propagation, and `src/RecipeHub.Web/src/pages/RecipeDetailPage.tsx` owns the detail-page favorite toggle.
- 2026-05-27: Frontend validation for RecipeHub.Web is `npm run lint`, `npm run test`, and `npm run build` from `src/RecipeHub.Web`.
- 2026-05-27: Backend favorites responses include recipe-prefixed fields (`recipeTitle`, `recipeTagNames`, etc.) alongside legacy aliases for compatibility during contract transition; coordinate DTO shape finalization with backend when ready.
- 2026-05-27: Cook Mode accessibility patterns: Use WCAG 2.2 AA contrast minimums (4.5:1 for normal text, 3:1 for large text), add `role="alert"` to error messages, `role="timer"` to timers with `aria-atomic="true"` on the display, descriptive `aria-label` on all buttons (context matters), and `focus-visible` styles matching the global focus pattern. Disabled states need opacity + grayscale filter to maintain sufficient contrast.
- 2026-05-27: Cook Mode UI lives in `src/RecipeHub.Web/src/pages/CookModePage.tsx` with styles in `CookModePage.module.css`. Timer component is inline, uses `useTimer` hook, and requires ARIA labels for accessibility. Button component is shared from `src/RecipeHub.Web/src/components/ui/Button.tsx`.
- 2026-05-27: Systemic WCAG 2.2 AA accessibility implemented with CSS color tokens in `src/RecipeHub.Web/src/index.css`. All component and page CSS modules reference these tokens for consistent, maintainable accessibility. Text contrast meets 4.5:1 for normal text, 3:1 for large text. Tokens cover primary/secondary/tertiary text, backgrounds, borders, buttons, links, and error states. This pattern scales better than per-component color values and ensures future changes maintain accessibility compliance.
- 2026-05-27: Accessibility touch target minimum of 24px enforced across interactive elements (buttons, links, form controls). Button disabled state uses 0.7 opacity + brightness filter to maintain sufficient contrast. Focus-visible indicators are consistent 2px solid outline with 2px offset.
- 2026-05-27: **Critical accessibility pattern (REGR-1)**: Light-background card components MUST explicitly set color on nested text elements (e.g., `p`, `span`), not just the container. Setting color only on the parent container is insufficient because nested elements can inherit white/low-contrast text from OS dark mode or browser defaults. Cook Mode instruction card failure (`copilot-image-1692f6.png`) showed white-on-white text despite parent having correct color. Fix: `.instruction { color: var(--color-text-primary); }` AND `.instruction p { color: var(--color-text-primary); }`. This prevents inheritance bugs in multi-mode contexts.

