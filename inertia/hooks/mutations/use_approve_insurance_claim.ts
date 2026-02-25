import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type ApproveClaimData = {
  claimId: string
  notes?: string
}

export function useApproveInsuranceClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApproveClaimData) => {
      const { claimId, notes } = data
      return tuyau
        .$route('api.v1.insurance.claims.approve', { claimId })
        .$post({ claimId, notes })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'claims'] })
      queryClient.invalidateQueries({ queryKey: ['insurance', 'stats'] })
    },
  })
}
