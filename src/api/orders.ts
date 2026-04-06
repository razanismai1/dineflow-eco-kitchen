import { apiClient } from './client';
import { fromOrderResponse, toOrderCreatePayload } from './mappers';

export const ordersApi = {
  getOrders: async (params?: { status?: string; table_id?: string | number }) => {
    const { data } = await apiClient.get('/orders/', { params });
    // Return mapped from response
    if (Array.isArray(data)) {
        return data.map(fromOrderResponse);
    }
    // Handle paginated responses
    if (data && data.results) {
        return {
           ...data,
           results: data.results.map(fromOrderResponse)
        };
    }
    return data;
  },
  updateStatus: async (id: number, status: string) => {
    const { data } = await apiClient.patch(`/orders/${id}/update_status/`, { status });
    return fromOrderResponse(data);
  },
  createOrder: async (items: { id: number, quantity: number }[], extra: any = {}) => {
    // Transform items array and include table reference only when provided.
    const payload: any = {
      items: items.map(item => ({
        menu_item_id: item.id,
        quantity: item.quantity,
      })),
    };

    const tableId = extra?.table_id ?? extra?.table;
    if (tableId !== undefined && tableId !== null && tableId !== '') {
      payload.table_id = tableId;
    }

    const { data } = await apiClient.post('/orders/', payload);
    return fromOrderResponse(data);
  }
};
