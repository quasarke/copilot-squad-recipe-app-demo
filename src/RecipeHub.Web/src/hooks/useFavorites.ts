import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../api';
import type { Favorite } from '../api';
import { favoriteKeys } from './queryKeys';

export function useFavorites() {
  return useQuery<Favorite[]>({
    queryKey: favoriteKeys.lists(),
    queryFn: () => apiClient.listFavorites(),
  });
}

export function useAddFavorite() {
  const queryClient = useQueryClient();

  return useMutation<Favorite, Error, number>({
    mutationFn: (recipeId) => apiClient.addFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}

export function useRemoveFavorite() {
  const queryClient = useQueryClient();

  return useMutation<void, Error, number>({
    mutationFn: (recipeId) => apiClient.removeFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: favoriteKeys.lists() });
    },
  });
}

export function useIsFavorite(recipeId: number) {
  const { data } = useFavorites();

  return data?.some((favorite) => favorite.recipeId === recipeId) ?? false;
}
