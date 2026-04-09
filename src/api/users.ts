import { apiClient } from './client';

export const usersApi = {
  getMe: async () => {
    const { data } = await apiClient.get('/users/me/');
    return data;
  },
  getAll: async () => {
    const { data } = await apiClient.get('/users/');
    return data;
  },
  createStaff: async (userData: Record<string, any>) => {
    const { data } = await apiClient.post('/users/', userData);
    return data;
  },
  updateStaff: async (id: number, userData: Record<string, any>) => {
    const { data } = await apiClient.patch(`/users/${id}/`, userData);
    return data;
  },
  deleteStaff: async (id: number) => {
    const { data } = await apiClient.delete(`/users/${id}/`);
    return data;
  },
  getCustomerPoints: async (id: string) => {
    const { data } = await apiClient.get(`/users/customers/${id}/points/`);
    return data;
  },
  syncEcoPoints: async (eco_points: number) => {
    const { data } = await apiClient.patch('/users/sync_eco_points/', { eco_points });
    return data;
  },
};
