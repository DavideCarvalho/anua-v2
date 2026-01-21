import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.insurance.claims.approve')

type ApproveClaimData = {
  claimId: string
  notes?: string
}

export function useApproveInsuranceClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApproveClaimData) => {
      const { claimId, notes } = data
      return $route.$post({ params: { claimId }, notes } as any).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'claims'] })
      queryClient.invalidateQueries({ queryKey: ['insurance', 'stats'] })
    },
  })
}
