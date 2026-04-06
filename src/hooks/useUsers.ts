import { useQuery } from '@tanstack/react-query';
import { usersApi } from '../api/users';

export function useMe(enabled: boolean, tokenKey?: string | null) {
  return useQuery({
    // Include token key to prevent stale user role across account switches.
    queryKey: ['users', 'me', tokenKey || null],
    queryFn: usersApi.getMe,
    enabled,
    retry: false, // Don't retry failing /me on 401s
    staleTime: 0,
    refetchOnMount: 'always',
  });
}
