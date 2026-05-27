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

