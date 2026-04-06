import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { floorApi } from '../api/floor';
import { NormalizedError } from '../api/errors';

export function useTables() {
  return useQuery({
    queryKey: ['floor', 'tables'],
    queryFn: floorApi.getTables,
  });
}

export function useUpdateTableStatus() {
  const queryClient = useQueryClient();

  return useMutation<any, NormalizedError, { id: number | string; status: string }, { previousTables: any }>({
    mutationFn: ({ id, status }) => floorApi.updateTableStatus(id, status),
    onMutate: async ({ id, status }) => {
      await queryClient.cancelQueries({ queryKey: ['floor', 'tables'] });
      const previousTables = queryClient.getQueryData(['floor', 'tables']);

      queryClient.setQueryData(['floor', 'tables'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.map(t => t.id === id ? { ...t, status } : t);
      });

      return { previousTables };
    },
    onError: (err, variables, context) => {
      if (context?.previousTables) {
        queryClient.setQueryData(['floor', 'tables'], context.previousTables);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['floor', 'tables'] });
    },
  });
}

export function useAlerts() {
  return useQuery({
    queryKey: ['floor', 'alerts'],
    queryFn: floorApi.getAlerts,
  });
}

export function useDismissAlert() {
  const queryClient = useQueryClient();

  return useMutation<any, NormalizedError, number | string, { previousAlerts: any }>({
    mutationFn: (id) => floorApi.dismissAlert(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: ['floor', 'alerts'] });
      const previousAlerts = queryClient.getQueryData(['floor', 'alerts']);

      queryClient.setQueryData(['floor', 'alerts'], (old: any) => {
        if (!Array.isArray(old)) return old;
        return old.filter(a => a.id !== id); // optimistic removal
      });

      return { previousAlerts };
    },
    onError: (err, id, context) => {
      if (context?.previousAlerts) {
        queryClient.setQueryData(['floor', 'alerts'], context.previousAlerts);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['floor', 'alerts'] });
    },
  });
}
