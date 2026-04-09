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
  createItem: async (payload: any) => {
    const isFormData = payload instanceof FormData;
    const { data } = await apiClient.post('/menu/items/', payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return data;
  },
  updateItem: async (id: number, payload: any) => {
    const isFormData = payload instanceof FormData;
    const { data } = await apiClient.patch(`/menu/items/${id}/`, payload, {
      headers: isFormData ? { 'Content-Type': 'multipart/form-data' } : undefined
    });
    return data;
  },
  deleteItem: async (id: number) => {
    await apiClient.delete(`/menu/items/${id}/`);
  },
};
