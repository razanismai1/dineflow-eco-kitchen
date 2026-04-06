import { apiClient } from './client';

export const inventoryApi = {
  getSuppliers: async () => {
    const { data } = await apiClient.get('/inventory/suppliers/');
    return data;
  },
  getItems: async (params?: { status?: 'low_stock' | 'expiring_soon' | string }) => {
    const { data } = await apiClient.get('/inventory/items/', { params });
    return data;
  },
  createItem: async (payload: {
    name: string;
    quantity: number;
    unit: string;
    expiry_date: string;
    supplier?: number | null;
  }) => {
    const { data } = await apiClient.post('/inventory/items/', payload);
    return data;
  },
  getLogs: async () => {
    const { data } = await apiClient.get('/inventory/logs/');
    return data;
  },
  getStats: async () => {
    const { data } = await apiClient.get('/inventory/logs/stats/');
    return data;
  },
};
