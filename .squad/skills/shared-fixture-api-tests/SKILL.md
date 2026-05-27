---
name: "shared-fixture-api-tests"
description: "Write contract-first integration tests against a shared WebApplicationFactory database without cross-test pollution."
domain: "testing"
confidence: "high"
source: "observed"
---

## Context
Use this when API integration tests share a seeded database through `WebApplicationFactory` and the implementation is landing concurrently with the tests.

## Patterns
- Keep tests contract-first: assert HTTP status codes and response payload shape from the public API.
- Use test-local request/response DTOs when the production DTO type is missing or still evolving.
- Generate unique tenant/user identifiers per test so shared fixture state does not leak between methods.
- Pull expected seeded values from the test database when you need to verify a rich DTO without hardcoding large payloads.
- Prefer API-level verification for behavior, then use direct DB reads only for stable seed expectations.

## Examples
- `tests/RecipeHub.Api.Tests/TestBase.cs` provides `RecipeApiFactory` with a seeded SQLite database.
- `tests/RecipeHub.Api.Tests/FavoriteEndpointTests.cs` uses unique `userId` values plus private DTOs to cover GET/POST/DELETE favorites flows.

## Anti-Patterns
- Reusing the same user identity across tests in a shared fixture database.
- Binding tests directly to production DTO types that have not been finalized yet.
- Hardcoding large seeded descriptions when the same expected values can be queried from the seeded database.
