import { useQuery } from '@tanstack/react-query';
import { menuApi } from '../api/menu';

export function useCategories() {
  return useQuery({
    queryKey: ['menu', 'categories'],
    queryFn: menuApi.getCategories,
  });
}

export function useMenuItems(params?: { category?: string; is_flash?: boolean }) {
  return useQuery({
    queryKey: ['menu', 'items', params],
    queryFn: () => menuApi.getItems(params),
  });
}

export function useFlashSales() {
  return useQuery({
    queryKey: ['menu', 'flash-sales'],
    queryFn: menuApi.getFlashSales,
  });
}
