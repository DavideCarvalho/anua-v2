import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type MarkClaimPaidData = {
  claimId: string
  notes?: string
}

export function useMarkClaimPaidMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MarkClaimPaidData) => {
      const { claimId, notes } = data
      return tuyau
        .$route('api.v1.insurance.claims.markPaid', { claimId })
        .$post({ claimId, notes })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'claims'] })
      queryClient.invalidateQueries({ queryKey: ['insurance', 'stats'] })
    },
  })
}
