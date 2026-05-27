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

### Git Hooks & Pre-Commit Validation

**Domain:** Repository governance

Husky is installed at repo root so Git hooks live at the root and cover both .NET and frontend checks. `pre-commit` runs the root `verify:precommit` script, orchestrating existing frontend lint, frontend tests, and `dotnet test`. No new lint, test, or build tools were added; scripts only orchestrate existing npm and dotnet commands.

**Rationale:**
- Single unified pre-commit gate prevents bad commits from both backend and frontend
- Reuses existing validation infrastructure
- Minimal tooling surface

**Owner:** Kyle

---

### WCAG 2.2 Color Contrast Standards

**Domain:** Frontend accessibility

**Status:** Implemented

**Decision:** Adopt WCAG 2.2 Level AA color contrast standards across the frontend, replacing light gray text colors with darker, more accessible values.

**Context:** Issue #1 identified multiple accessibility problems related to color contrast:
- RecipeHub app label was hard to read
- Inactive menu buttons were difficult to see
- Recipe metadata text lacked sufficient contrast
- Various gray text throughout the app failed WCAG guidelines

**Approach:**

Contrast Ratios Applied:
- **Normal text** (< 18pt or < 14pt bold): 4.5:1 minimum
- **Large text** (≥ 18pt or ≥ 14pt bold): 3.0:1 minimum

Color Replacements (replaced light grays with darker, WCAG-compliant values):
- `#333` → `#1a1a1a` (navigation, brand)
- `#444` → `#2a2a2a` (descriptions)
- `#555` → `#404040` (metadata)
- `#666` → `#4a4a4a` (secondary text, timers, notes)
- `#6b7280` → `#4a4a4a` (card footers)

Files Updated:
- `App.module.css` - Navigation and brand
- `RecipeDetailPage.module.css` - Metadata and timers
- `RecipeListPage.module.css` - Descriptions and meta text
- `HomePage.module.css` - Tagline and metadata
- `FavoritesPage.module.css` - Wrapper text and notes
- `Card.module.css` - Footer text
- `SearchBar.module.css` - Clear button
- `RecipeEditPage.module.css` - Step numbers
- `App.css` - Debug text

**Rationale:**
- **User-first**: Accessibility is non-negotiable. If users can't read the interface, it's broken.
- **Standards compliance**: WCAG 2.2 Level AA is the baseline for modern web applications
- **Maintainability**: Used a consistent set of darker grays rather than one-off adjustments, making it easier to maintain consistent contrast ratios
- **No visual regression**: The changes improve readability without requiring layout changes or breaking existing functionality

**Validation:** All frontend validation passed:
- ✅ `npm run lint` - No ESLint errors
- ✅ `npm run test` - All tests pass
- ✅ `npm run build` - Clean production build

**Owner:** Kenny

**Related:** Issue #1 (Accessibility UI Problems), PR #4 (fix: improve color contrast for WCAG 2.2 compliance)

---

## Governance

- All meaningful changes require team consensus
- Document architectural decisions here
- Keep history focused on work, decisions focused on direction
