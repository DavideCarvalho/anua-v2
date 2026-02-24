import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.contracts.getSignatureStats')
export type ContractSignatureStatsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useContractSignatureStatsQueryOptions(contractId: string) {
  const params = { contractId }

  return queryOptions({
    queryKey: ['contracts', 'signature-stats', params],
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.getSignatureStats', params).$get().unwrap()
    },
  })
}
