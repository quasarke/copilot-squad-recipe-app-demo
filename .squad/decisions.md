# Squad Decisions

## Active Decisions

### Favorites API DTO Compatibility

**Domain:** Backend API contract

Implemented `FavoriteDto` with recipe-prefixed fields (`recipeTitle`, `recipeTagNames`, etc.) while maintaining legacy flattened aliases (`title`, `tagNames`, etc.) for backward compatibility. 

**Rationale:** Allows frontend and QA to consume the new contract incrementally without a forced breaking migration.

**Action:** Keep alias properties until frontend and QA explicitly converge on the new contract, then remove in coordinated cleanup.

**Owner:** Stan

---

### Favorites Frontend Data Flow

**Domain:** Frontend architecture

Favorites use the shared frontend API client and TanStack Query hooks instead of page-local state. Until authentication exists, the client supplies hardcoded `default-user` userId for all requests.

**Rationale:** 
- Keeps favorites aligned with existing recipe/tag data-access patterns
- Limits the eventual auth swap to one shared API boundary (single change point when auth arrives)

**Impacted files:**
- `src/RecipeHub.Web/src/api/client.ts`
- `src/RecipeHub.Web/src/hooks/useFavorites.ts`

**Owner:** Kenny

---

### Favorites Integration Testing Strategy

**Domain:** API test contract

Favorites integration tests use contract-first approach with private test-only DTOs. Each test uses a unique `userId` to avoid state bleed when sharing `RecipeApiFactory` database.

**Rationale:**
- QA can land coverage before production DTO shape is finalized
- Unique userId per test prevents cross-test state contamination with shared factory database

**Owner:** Kyle

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
