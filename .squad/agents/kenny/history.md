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
- 2026-05-27: WCAG 2.2 accessibility compliance requires minimum contrast ratios: 4.5:1 for normal text, 3.0:1 for large text. Used darker grays (`#1a1a1a`, `#2a2a2a`, `#404040`, `#4a4a4a`) instead of lighter ones (`#333`, `#444`, `#555`, `#666`) to meet these standards across all CSS modules.
- 2026-05-27: Accessibility fixes span multiple CSS modules: `App.module.css` (nav and brand), page-specific modules (`RecipeDetailPage.module.css`, `RecipeListPage.module.css`, `HomePage.module.css`, `FavoritesPage.module.css`), and component modules (`Card.module.css`, `SearchBar.module.css`, `RecipeEditPage.module.css`). Pattern: replace all light gray text colors with WCAG-compliant darker values.
