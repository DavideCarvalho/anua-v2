import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.contracts.interestConfig.show')
export type ContractInterestConfigResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useContractInterestConfigQueryOptions(contractId: string) {
  return {
    queryKey: ['contract-interest-config', contractId] as const,
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.contracts.interestConfig.show', { contractId })
        .$get({})
        .unwrap()
    },
    enabled: !!contractId,
  }
}
