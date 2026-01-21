import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.insurance.claims.reject')

type RejectClaimData = {
  claimId: string
  rejectionReason: string
}

export function useRejectInsuranceClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: RejectClaimData) => {
      const { claimId, rejectionReason } = data
      return $route.$post({ params: { claimId }, rejectionReason } as any).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'claims'] })
      queryClient.invalidateQueries({ queryKey: ['insurance', 'stats'] })
    },
  })
}
