import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearSession } from './auth';
import { normalizeApiError } from './errors';

export const BASE_URL = import.meta.env.VITE_API_URL || '/api/v1/';

export const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach Token
apiClient.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Ensure trailing slash logic (Django requirement)
  if (config.url && !config.url.endsWith('/') && !config.url.includes('?')) {
    config.url = `${config.url}/`;
  } else if (config.url && config.url.includes('?') && !config.url.split('?')[0].endsWith('/')) {
      const [path, query] = config.url.split('?');
      config.url = `${path}/?${query}`;
  }
  
  return config;
}, (error) => Promise.reject(error));

// Response Interceptor: Handle 401 & Refresh Token
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (err: any) => void }> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token) {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If it's a 401, not a retry, and we are not trying to refresh
    if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
      if (originalRequest.url?.includes('auth/refresh/')) {
        // We failed while trying to refresh
        clearSession();
        // optionally trigger a redirect to login
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearSession();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(error);
      }

      if (isRefreshing) {
        // Queue this request while token is refreshing
        return new Promise(function (resolve, reject) {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = 'Bearer ' + token;
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const { data } = await axios.post(`${BASE_URL}auth/refresh/`, {
          refresh: refreshToken,
        });
        
        const newAccess = data.access;
        // some backends issue a new refresh token too
        const newRefresh = data.refresh || refreshToken; 
        
        setTokens(newAccess, newRefresh);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${newAccess}`;
        originalRequest.headers.Authorization = `Bearer ${newAccess}`;
        
        processQueue(null, newAccess);
        return apiClient(originalRequest);
        
      } catch (refreshError) {
        processQueue(refreshError, null);
        clearSession();
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(normalizeApiError(error));
  }
);
