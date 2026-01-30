import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useRespondConsentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { id: string; approved: boolean; notes?: string }) => {
      const { id, approved, notes } = data
      return tuyau.$route('api.v1.consents.respond', { id }).$post({ approved, notes } as any).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['parental-consents'] })
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
