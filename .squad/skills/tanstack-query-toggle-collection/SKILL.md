---
name: "tanstack-query-toggle-collection"
description: "Implement collection-backed toggle features in the React frontend with TanStack Query."
domain: "frontend-state"
confidence: "high"
source: "earned"
---

## Context
Use this pattern when the UI needs to toggle membership in a server-backed collection, such as favorites, bookmarks, or saved items, while staying inside the existing React + TanStack Query architecture.

## Patterns
- Add typed API client methods for list, add, and remove operations in `src/RecipeHub.Web/src/api/client.ts`.
- Add a dedicated query-key factory in `src/RecipeHub.Web/src/hooks/queryKeys.ts` for the collection list.
- Create a hook module with one `useQuery`, add/remove `useMutation` hooks, and a derived boolean helper such as `useIsFavorite()`.
- Invalidate the collection list query on mutation success instead of manually syncing component state.
- For clickable cards with nested action buttons, stop event propagation on the nested button so remove/toggle actions do not trigger navigation.
- Keep auth placeholders, such as the current `default-user` favorites identity, inside the shared client layer rather than threading them through components.

## Examples
- Favorites API methods: `src/RecipeHub.Web/src/api/client.ts`
- Favorites hooks and derived state: `src/RecipeHub.Web/src/hooks/useFavorites.ts`
- Clickable favorites grid with nested remove button: `src/RecipeHub.Web/src/pages/FavoritesPage.tsx`
- Detail-page toggle button driven by hooks: `src/RecipeHub.Web/src/pages/RecipeDetailPage.tsx`

## Anti-Patterns
- Manual `fetch` + `useState` flows for server state that should live in TanStack Query.
- Duplicating user context or collection query keys across pages.
- Letting nested buttons bubble clicks inside clickable cards, which causes accidental navigation.
