import { useQuery } from '@tanstack/react-query';
import { analyticsApi } from '../api/analytics';

export function useDashboardAnalytics() {
  return useQuery({
    queryKey: ['analytics', 'dashboard'],
    queryFn: analyticsApi.getDashboard,
  });
}

export function useSalesVsWasteChart() {
  return useQuery({
    queryKey: ['analytics', 'charts', 'sales-vs-waste'],
    queryFn: analyticsApi.getSalesVsWasteChart,
  });
}

export function useAiInsights() {
  return useQuery({
    queryKey: ['analytics', 'ai-insights'],
    queryFn: analyticsApi.getAiInsights,
  });
}
