import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.insurance.claims.approve')
type ApproveClaimData = {
  claimId: string
  notes?: string
}

export function useApproveInsuranceClaimMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: ApproveClaimData) => {
      const { claimId, notes } = data
      return resolveRoute()
        .$post({ params: { claimId }, notes } as any)
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance', 'claims'] })
      queryClient.invalidateQueries({ queryKey: ['insurance', 'stats'] })
    },
  })
}
