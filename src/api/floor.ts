import { apiClient } from './client';

export const floorApi = {
  getTables: async () => {
    const { data } = await apiClient.get('/floor/tables/');
    return data;
  },
  createTable: async (payload: { name: string; capacity: number; status?: string }) => {
    const { data } = await apiClient.post('/floor/tables/', payload);
    return data;
  },
  updateTableStatus: async (id: number | string, status: string) => {
    const { data } = await apiClient.patch(`/floor/tables/${id}/update_status/`, { status });
    return data;
  },
  getAlerts: async () => {
    const { data } = await apiClient.get('/floor/alerts/');
    return data;
  },
  dismissAlert: async (id: number | string) => {
    const { data } = await apiClient.patch(`/floor/alerts/${id}/dismiss/`, {});
    return data;
  },
};
