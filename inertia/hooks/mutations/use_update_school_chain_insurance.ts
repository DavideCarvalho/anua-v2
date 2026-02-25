import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

type UpdateSchoolChainInsuranceData = {
  chainId: string
  hasInsuranceByDefault?: boolean
  insurancePercentage?: number | null
  insuranceCoveragePercentage?: number | null
  insuranceClaimWaitingDays?: number | null
}

export function useUpdateSchoolChainInsuranceMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: UpdateSchoolChainInsuranceData) => {
      const { chainId, ...rest } = data
      return tuyau
        .$route('api.v1.insurance.updateChain', { chainId })
        .$put({ chainId, ...rest })
        .unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['insurance'] })
      queryClient.invalidateQueries({ queryKey: ['schoolChains'] })
    },
  })
}
