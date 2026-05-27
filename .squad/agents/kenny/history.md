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
