import { useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi } from '../api/authApi';
import { clearSession } from '../api/auth';
import { NormalizedError } from '../api/errors';

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<any, NormalizedError, Record<string, any>>({
    mutationFn: authApi.login,
    onSuccess: () => {
      // Clear cache on new login
      queryClient.clear();
    },
  });
}

export function useRegister() {
  return useMutation<any, NormalizedError, Record<string, any>>({
    mutationFn: authApi.register,
  });
}

export function useLogout() {
  const queryClient = useQueryClient();
  
  return () => {
    clearSession();
    queryClient.clear();
    window.location.href = '/'; // Simple redirect strategy
  };
}
