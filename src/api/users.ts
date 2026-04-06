import { apiClient } from './client';

export const usersApi = {
  getMe: async () => {
    const { data } = await apiClient.get('/users/me/');
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
