import { apiClient } from './client';
import { clearSession, setTokens } from './auth';

export const authApi = {
  login: async (credentials: Record<string, any>) => {
    // Reset old session before new login attempt.
    clearSession();

    // Convert email to username (Django TokenObtainPairView expects username field)
    const loginPayload = {
      username: credentials.email || credentials.username,
      password: credentials.password,
    };
    const { data } = await apiClient.post('/auth/login/', loginPayload);
    if (data.access && data.refresh) {
      setTokens(data.access, data.refresh);
    }
    return data;
  },
  register: async (userData: Record<string, any>) => {
    // Frontend sends { name, email, password, role } - backend now accepts 'name'
    const { data } = await apiClient.post('/auth/register/', userData);
    return data;
  },
};
