# Project Context

- **Owner:** Zack Way
- **Project:** RecipeHub — a full-stack recipe management app built with .NET Aspire 13.2. .NET 10 Minimal API backend with EF Core 10 + SQLite. React 19 + TypeScript + Vite 6 frontend with TanStack Query v5. Aspire dashboard for observability. Built for the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET 10, Aspire 13.2, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit
- **Created:** 2026-05-27

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- `tests\RecipeHub.Api.Tests\TestBase.cs` provides `RecipeApiFactory`, a shared `WebApplicationFactory<Program>` that uses one temp-file SQLite database per test class, applies migrations, and boots the app with seeded data.
- `src\RecipeHub.Api\Data\SeedData.cs` seeds 12 sample recipes with stable IDs starting at 1 and leaves `Favorites` empty, which makes contract-first favorites integration tests straightforward.
- When API tests share the same factory-backed database, use unique `userId` values per test to avoid cross-test state bleed while still using `IClassFixture<RecipeApiFactory>`.
- Favorites integration tests (`tests/RecipeHub.Api.Tests/FavoriteEndpointTests.cs`) use contract-first approach with private test-only DTOs, allowing QA to land full coverage (12 tests: CRUD flow, 404, 409 duplicate, per-user isolation, default-user) before backend DTO shape is finalized.
- 2026-05-27: Husky is rooted in the repo-level `package.json`; `pre-commit` runs `npm run verify:precommit`, which covers frontend lint/tests and `dotnet test`.
- 2026-05-27: Git hooks are unified at repo root to cover both .NET and frontend validations in one pre-commit gate. No new tools added; orchestrates existing npm and dotnet commands.
- 2026-05-27: Cook Mode accessibility audit (issue #1) — key files: `src/RecipeHub.Web/src/pages/CookModePage.tsx` + `.module.css`, `src/hooks/useCookMode.ts`, `src/components/ui/Button.tsx`. Current implementation has solid semantic foundation (landmarks, ARIA live regions) but fails on: contrast (back link `#4a7fbf`, error text `#a33`), touch targets (small buttons < 24×24px), focus styles (back link missing `:focus-visible`), and screen reader announcements (step changes, timer state transitions). Critical checklist items documented in `.squad/decisions/inbox/kyle-cook-mode-a11y-audit.md` for Kenny's implementation and later review gate.
- 2026-05-27: Frontend accessibility testing skill created at `.squad/skills/frontend-accessibility-testing/SKILL.md` — covers WCAG 2.2 Level AA patterns for contrast, touch targets, focus management, ARIA live regions, semantic HTML, and error states. Includes testing checklist template and automated testing integration guidance (vitest-axe).
- 2026-05-27: PR #5 review gate passed (8/8 critical items) — Kenny's initial implementation passed 5/8 (contrast, focus-visible, error alerts, button touch targets), blocked on STEP-1 (step heading announcements) and TGT-1 (back link touch target). Cartman fixed both blockers in commit `16c3c0e`: added `aria-live="polite"` to step heading (line 74) and `padding: 0.25rem 0` + `min-height: 24px` to `.back` link (lines 13-14). All WCAG 2.2 Level AA requirements met for Cook Mode accessibility. PR #5 approved for merge, ready to close issue #1.

