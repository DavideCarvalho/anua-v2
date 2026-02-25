import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type RejectClaimData = {
  claimId: string
  rejectionReason: string
}

export function useRejectInsuranceClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RejectClaimData) => {
      const { claimId, rejectionReason } = data
      return tuyau
        .$route('api.v1.insurance.claims.reject', { claimId })
        .$post({ claimId, rejectionReason })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'claims'] })
      queryClient.invalidateQueries({ queryKey: ['insurance', 'stats'] })
    },
  })
}
