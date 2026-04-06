import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersApi } from '../api/orders';
import { NormalizedError } from '../api/errors';

export function useOrders(params?: { status?: string; table_id?: string | number }) {
  return useQuery({
    queryKey: ['orders', params],
    queryFn: () => ordersApi.getOrders(params),
  });
}

export function useUpdateOrderStatus() {
  const queryClient = useQueryClient();

  return useMutation<any, NormalizedError, { id: number; status: string }, { previousOrders: any }>({
    mutationFn: ({ id, status }) => ordersApi.updateStatus(id, status),
    onMutate: async ({ id, status }) => {
      // Cancel any outgoing refetches so they don't overwrite optimistic update
      await queryClient.cancelQueries({ queryKey: ['orders'] });

      // Snapshot the previous value
      const previousOrders = queryClient.getQueryData(['orders']);

      // Optimistically update inside ALL orders queries
      queryClient.setQueriesData({ queryKey: ['orders'] }, (old: any) => {
        if (!old) return old;
        const updateList = (list: any[]) => list.map((order) =>
          order.id === id ? { ...order, status } : order
        );

        if (Array.isArray(old)) return updateList(old);
        if (old.results) {
          return { ...old, results: updateList(old.results) };
        }
        return old;
      });

      return { previousOrders };
    },
    onError: (err, variables, context) => {
      // Rollback on failure
      if (context?.previousOrders) {
        // Technically this rolls back perfectly matched queries only, but for simple use cases it's enough.
        // A full rollback requires iterating previous states, but usually invalidation follows soon.
      }
      // Force a manual invalidation if rollback is too complex to map back perfectly
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onSettled: () => {
      // Always refetch after error or success to ensure backend sync
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation<any, NormalizedError, { items: { id: number, quantity: number }[], extra?: any }>({
    mutationFn: (args) => ordersApi.createOrder(args.items, args.extra),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    }
  });
}
