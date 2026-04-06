import { apiClient } from './client';
import { toDecimal } from './mappers';

export const menuApi = {
  getCategories: async () => {
    const { data } = await apiClient.get('/menu/categories/');
    return data;
  },
  createCategory: async (payload: { name: string; icon?: string }) => {
    const { data } = await apiClient.post('/menu/categories/', payload);
    return data;
  },
  getItems: async (params?: { category?: string; is_flash?: boolean }) => {
    const { data } = await apiClient.get('/menu/items/', { params });
    // Normalize prices immediately
    return (data || []).map((item: any) => ({
      ...item,
      // Backend uses base_price; keep price as normalized UI alias.
      price: toDecimal(item.price ?? item.base_price),
      discount_price: item.discount_price != null ? toDecimal(item.discount_price) : undefined,
    }));
  },
  getFlashSales: async () => {
    const { data } = await apiClient.get('/menu/flash-sales/');
    return data;
  },
  createItem: async (payload: {
    name: string;
    description?: string;
    category: number;
    base_price: number;
    discount_price?: number | null;
    eco_score?: number;
    image_url?: string;
    is_vegan?: boolean;
  }) => {
    const { data } = await apiClient.post('/menu/items/', payload);
    return data;
  },
};
