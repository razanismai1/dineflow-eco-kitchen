import { apiClient } from './client';

export const inventoryApi = {
  getSuppliers: async () => {
    const { data } = await apiClient.get('/inventory/suppliers/');
    return data;
  },
  createSupplier: async (payload: any) => {
    const { data } = await apiClient.post('/inventory/suppliers/', payload);
    return data;
  },
  updateSupplier: async (id: number, payload: any) => {
    const { data } = await apiClient.patch(`/inventory/suppliers/${id}/`, payload);
    return data;
  },
  deleteSupplier: async (id: number) => {
    const { data } = await apiClient.delete(`/inventory/suppliers/${id}/`);
    return data;
  },
  getItems: async (params?: { status?: 'low_stock' | 'expiring_soon' | string }) => {
    const { data } = await apiClient.get('/inventory/items/', { params });
    return data;
  },
  createItem: async (payload: {
    name: string;
    category?: string;
    quantity: number;
    unit: string;
    daily_requirement?: number;
    expiry_date: string;
    supplier?: number | null;
  }) => {
    const { data } = await apiClient.post('/inventory/items/', payload);
    return data;
  },
  updateItem: async (id: number, payload: any) => {
    const { data } = await apiClient.patch(`/inventory/items/${id}/`, payload);
    return data;
  },
  deleteItem: async (id: number) => {
    const { data } = await apiClient.delete(`/inventory/items/${id}/`);
    return data;
  },
  getLogs: async () => {
    const { data } = await apiClient.get('/inventory/logs/');
    return data;
  },
  createLog: async (payload: {
    inventory_item?: number | null;
    menu_item?: number | null;
    quantity: number;
    unit: string;
    reason: string;
    notes?: string;
  }) => {
    const { data } = await apiClient.post('/inventory/logs/', payload);
    return data;
  },
  getStats: async () => {
    const { data } = await apiClient.get('/inventory/logs/stats/');
    return data;
  },
};
