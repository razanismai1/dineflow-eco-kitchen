import { apiClient } from './client';

export const insightsApi = {
  getDailyInsight: async () => {
    const { data } = await apiClient.get('/analytics/insights/');
    return data;
  },
  regenerateInsight: async () => {
    const { data } = await apiClient.post('/analytics/insights/regenerate/');
    return data;
  },
};
