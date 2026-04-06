import { useQuery } from '@tanstack/react-query';
import { inventoryApi } from '../api/inventory';

export function useSuppliers() {
  return useQuery({
    queryKey: ['inventory', 'suppliers'],
    queryFn: inventoryApi.getSuppliers,
  });
}

export function useInventoryItems(params?: { status?: string }) {
  return useQuery({
    queryKey: ['inventory', 'items', params],
    queryFn: () => inventoryApi.getItems(params),
  });
}

export function useInventoryLogs() {
  return useQuery({
    queryKey: ['inventory', 'logs'],
    queryFn: inventoryApi.getLogs,
  });
}

export function useInventoryStats() {
  return useQuery({
    queryKey: ['inventory', 'stats'],
    queryFn: inventoryApi.getStats,
  });
}
