import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.contracts.getSignatureStats')
export type ContractSignatureStatsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useContractSignatureStatsQueryOptions(contractId: string) {
  const params = { contractId }

  return {
    queryKey: ['contracts', 'signature-stats', params],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.contracts.getSignatureStats', params).$get().unwrap()
    },
  } satisfies QueryOptions<ContractSignatureStatsResponse>
}
