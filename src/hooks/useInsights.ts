import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { insightsApi } from '../api/insights';

export function useDailyInsight() {
  return useQuery({
    queryKey: ['analytics', 'daily-insight'],
    queryFn: insightsApi.getDailyInsight,
    // Data is fresh for the whole day — regenerate button resets the cache
    staleTime: Infinity,
    retry: 1,
  });
}

export function useRegenerateInsight() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: insightsApi.regenerateInsight,
    onSuccess: (data) => {
      // Replace cached data immediately with the fresh report
      queryClient.setQueryData(['analytics', 'daily-insight'], data);
    },
  });
}
