import { apiClient } from './client';
import { fromOrderResponse } from './mappers';

async function resolveTablePk(tableRef: unknown): Promise<number | undefined> {
  if (typeof tableRef === 'number' && Number.isInteger(tableRef) && tableRef > 0) {
    return tableRef;
  }

  if (typeof tableRef === 'string') {
    const trimmed = tableRef.trim();
    if (!trimmed) return undefined;

    const directNumber = Number(trimmed);
    if (Number.isInteger(directNumber) && directNumber > 0) {
      return directNumber;
    }

    const qrMatch = trimmed.match(/^T-(\d+)$/i);
    if (qrMatch) {
      const qrNumber = Number(qrMatch[1]);
      return Number.isInteger(qrNumber) && qrNumber > 0 ? qrNumber : undefined;
    }
  }

  return undefined;
}

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

    const resolvedTablePk = await resolveTablePk(extra?.table_id ?? extra?.table);
    if (resolvedTablePk) {
      payload.table_id = resolvedTablePk;
    }

    const { data } = await apiClient.post('/orders/', payload);
    return fromOrderResponse(data);
  }
};
