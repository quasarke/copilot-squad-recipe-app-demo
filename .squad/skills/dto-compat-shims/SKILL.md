---
name: "dto-compat-shims"
description: "How to evolve API DTOs without breaking existing clients and contract tests"
domain: "api-design"
confidence: "high"
source: "earned"
---

## Context
Use this when an API response shape needs new fields or renamed fields, but existing frontend code or contract tests still deserialize the old names. It is especially useful in teaching/demo codebases where tests and UI may land before the final DTO naming is settled.

## Patterns
- Keep the new DTO as the primary shape, with the canonical constructor properties matching the desired contract.
- Add read-only alias properties that mirror the legacy field names so JSON serialization emits both old and new names during the transition.
- Document the compatibility shim in squad decisions/history so the team can remove it later in a coordinated cleanup.
- Verify both the API behavior and the compatibility contract with integration tests before considering the change complete.

## Examples
- `src/RecipeHub.Api/Dtos/FavoriteDto.cs` exposes `RecipeTitle`, `RecipeTagNames`, and other recipe-prefixed fields while also exposing `Title`, `TagNames`, and matching legacy aliases.
- `tests/RecipeHub.Api.Tests/FavoriteEndpointTests.cs` confirms favorites responses still deserialize into the pre-existing flattened contract.

## Anti-Patterns
- Renaming JSON fields outright when active clients or tests still expect the previous names.
- Exposing EF entities directly just to avoid defining a transitional DTO.
- Leaving temporary compatibility fields undocumented so nobody knows when they can be removed.
