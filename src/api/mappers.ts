// src/api/mappers.ts

import { format, parseISO } from 'date-fns';

/**
 * Converts a string decimal representation to a number safely.
 */
export const toDecimal = (val: string | number | undefined | null): number => {
  if (val == null) return 0;
  const num = typeof val === 'string' ? parseFloat(val) : val;
  return isNaN(num) ? 0 : num;
};

/**
 * Normalizes date to a consistent format (e.g. YYYY-MM-DD HH:mm)
 */
export const normalizeDate = (dateString: string, dateFormat = 'yyyy-MM-dd HH:mm'): string => {
  try {
    return format(parseISO(dateString), dateFormat);
  } catch (e) {
    return dateString;
  }
};

/**
 * Maps the frontend order format into the expected creation payload.
 */
export const toOrderCreatePayload = (cartItems: { id: number; quantity: number }[], additionalData?: any) => {
  return {
    items: cartItems.map((item) => ({
      menu_item_id: item.id,
      quantity: item.quantity,
    })),
    ...additionalData,
  };
};

/**
 * Normalizes the backend order response format to the frontend format.
 * Often backend returns `menu_item_details` or nested structured. We flatten it here.
 */
export const fromOrderResponse = (order: any) => {
  return {
    ...order,
    items: (order.items || []).map((item: any) => ({
      ...item,
      id: item.menu_item ?? item.menu_item_id,
      name: item.menu_item_details?.name || item.name,
      price: toDecimal(item.menu_item_details?.price ?? item.menu_item_details?.base_price ?? item.price),
    })),
    totalAmount: toDecimal(order.total_amount),
  };
};
