import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { accountKeys, getProfile, submitInquiry, updateProfile } from '../api/account';

export function useProfile() {
  return useQuery({ queryKey: accountKeys.profile, queryFn: ({ signal }) => getProfile(signal) });
}

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateProfile,
    onSuccess: (profile) => queryClient.setQueryData(accountKeys.profile, profile),
  });
}

export function useSubmitInquiry() {
  return useMutation({ mutationFn: submitInquiry });
}
