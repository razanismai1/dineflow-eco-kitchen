import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useStaffList() {
  return useQuery({
    queryKey: ['users', 'staff'],
    queryFn: usersApi.getAll,
  });
}

export function useCreateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.createStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'staff'] });
    },
  });
}

export function useUpdateStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, any> }) => usersApi.updateStaff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'staff'] });
    },
  });
}

export function useDeleteStaff() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: usersApi.deleteStaff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users', 'staff'] });
    },
  });
}
