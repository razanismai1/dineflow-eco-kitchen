import axios, { AxiosError } from 'axios';

export interface NormalizedError {
  message: string;
  fieldErrors?: Record<string, string[]>;
  statusCode: number;
}

/**
 * Normalizes an Axios error strictly from a Django REST Backend
 * into a consistent NormalizedError format.
 */
export function normalizeApiError(error: unknown): NormalizedError {
  if (!axios.isAxiosError(error)) {
    return {
      message: error instanceof Error ? error.message : 'An unknown error occurred.',
      statusCode: 500,
    };
  }

  const err = error as AxiosError<any>;
  const statusCode = err.response?.status || 500;
  const data = err.response?.data;

  // No response body means we likely had a network error or 500 without json payload
  if (!data || typeof data !== 'object') {
    return {
      message: err.message,
      statusCode,
    };
  }

  // 1. Check for standard 'detail'
  if (typeof data.detail === 'string') {
    return {
      message: data.detail,
      statusCode,
    };
  }

  // 2. Check for 'non_field_errors'
  if (Array.isArray(data.non_field_errors) && data.non_field_errors.length > 0) {
    return {
      message: data.non_field_errors[0],
      statusCode,
    };
  }

  // 3. Check for field-level errors
  const fieldErrors: Record<string, string[]> = {};
  let firstFieldMsg = '';

  for (const [key, value] of Object.entries(data)) {
    // Prevent overriding top level keys just in case
    if (key === 'detail' || key === 'non_field_errors') continue;
    
    if (Array.isArray(value)) {
      fieldErrors[key] = value.map(String);
      if (!firstFieldMsg) firstFieldMsg = `${key}: ${value[0]}`;
    } else if (typeof value === 'string') {
      fieldErrors[key] = [value];
      if (!firstFieldMsg) firstFieldMsg = `${key}: ${value}`;
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      message: `Validation Error: ${firstFieldMsg}`,
      fieldErrors,
      statusCode,
    };
  }

  return {
    message: 'An unexpected response format was returned from the server.',
    statusCode,
  };
}
