import { apiClient } from './client';

export const analyticsApi = {
  getDashboard: async () => {
    const { data } = await apiClient.get('/analytics/dashboard/');
    return data;
  },
  getSalesVsWasteChart: async () => {
    const { data } = await apiClient.get('/analytics/charts/sales-vs-waste/');
    return data;
  },
  getAiInsights: async () => {
    const { data } = await apiClient.get('/analytics/ai-insights/');
    return data;
  },
};
