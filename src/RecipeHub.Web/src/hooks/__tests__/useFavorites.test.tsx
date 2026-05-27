import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react';
import { act, type ReactNode } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { apiClient, type Favorite } from '../../api';
import { favoriteKeys } from '../queryKeys';
import {
  useAddFavorite,
  useFavorites,
  useIsFavorite,
  useRemoveFavorite,
} from '../useFavorites';

const sampleFavorite: Favorite = {
  recipeId: 42,
  recipeTitle: 'Margherita Pizza',
  recipeDescription: 'Fresh basil, mozzarella, and tomato sauce.',
  recipeDifficulty: 'Medium',
  recipePrepTimeMinutes: 20,
  recipeCookTimeMinutes: 12,
  recipeServings: 4,
  recipeImageUrl: null,
  recipeTagNames: ['Italian', 'Vegetarian'],
  favoritedAt: '2026-05-27T00:00:00Z',
};

function createWrapper(client: QueryClient) {
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
}

describe('useFavorites', () => {
  let client: QueryClient;

  beforeEach(() => {
    client = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
        mutations: { retry: false },
      },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('loads favorites once and derives favorite state from the shared query cache', async () => {
    const listFavoritesSpy = vi.spyOn(apiClient, 'listFavorites').mockResolvedValue([
      sampleFavorite,
    ]);

    const { result } = renderHook(
      () => ({
        favoritesQuery: useFavorites(),
        isFavorite: useIsFavorite(sampleFavorite.recipeId),
      }),
      { wrapper: createWrapper(client) }
    );

    await waitFor(() => {
      expect(result.current.favoritesQuery.data).toEqual([sampleFavorite]);
    });

    expect(result.current.isFavorite).toBe(true);
    expect(listFavoritesSpy).toHaveBeenCalledTimes(1);
  });

  it('invalidates the favorites list after add and remove mutations succeed', async () => {
    const invalidateQueriesSpy = vi.spyOn(client, 'invalidateQueries');

    vi.spyOn(apiClient, 'addFavorite').mockResolvedValue(sampleFavorite);
    vi.spyOn(apiClient, 'removeFavorite').mockResolvedValue(undefined);

    const { result: addResult } = renderHook(() => useAddFavorite(), {
      wrapper: createWrapper(client),
    });
    const { result: removeResult } = renderHook(() => useRemoveFavorite(), {
      wrapper: createWrapper(client),
    });

    await act(async () => {
      await addResult.current.mutateAsync(sampleFavorite.recipeId);
    });

    expect(apiClient.addFavorite).toHaveBeenCalledWith(sampleFavorite.recipeId);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: favoriteKeys.lists(),
    });

    invalidateQueriesSpy.mockClear();

    await act(async () => {
      await removeResult.current.mutateAsync(sampleFavorite.recipeId);
    });

    expect(apiClient.removeFavorite).toHaveBeenCalledWith(sampleFavorite.recipeId);
    expect(invalidateQueriesSpy).toHaveBeenCalledWith({
      queryKey: favoriteKeys.lists(),
    });
  });
});
