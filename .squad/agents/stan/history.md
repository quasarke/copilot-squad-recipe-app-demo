# Project Context

- **Owner:** Zack Way
- **Project:** RecipeHub — a full-stack recipe management app built with .NET Aspire 13.2. .NET 10 Minimal API backend with EF Core 10 + SQLite. React 19 + TypeScript + Vite 6 frontend with TanStack Query v5. Aspire dashboard for observability. Built for the GitHub Copilot & Squad Developer Workflow Hackathon.
- **Stack:** .NET 10, Aspire 13.2, EF Core 10, SQLite, React 19, TypeScript, Vite 6, TanStack Query v5, xUnit
- **Created:** 2026-05-27

## Learnings

<!-- Append new learnings below. Each entry is something lasting about the project. -->
- Favorites now follow the same Minimal API pattern as recipes in `src/RecipeHub.Api/Endpoints/FavoriteEndpoints.cs`: async private handlers, `RecipeDbContext` injection, `CancellationToken`, and a private DTO mapper.
- Favorite responses are flattened recipe snapshots from `src/RecipeHub.Api/Dtos/FavoriteDto.cs`, including `FavoritedAt`; the DTO also keeps legacy field aliases (`Title`, `Description`, `TagNames`, etc.) so existing clients/tests keep working while recipe-prefixed fields are available.
- The favorites request boundary lives in `src/RecipeHub.Api/Dtos/AddFavoriteRequest.cs`, and the contract is covered by `tests/RecipeHub.Api.Tests/FavoriteEndpointTests.cs` with unique `userId` values because `RecipeApiFactory` shares one seeded SQLite database per test class.
- Favorites API intentionally keeps default-user fallback to support frontend hardcoding of `default-user` userId until authentication exists; this pattern lets the frontend and tests remain stable when auth is eventually plugged in (single swap point).
