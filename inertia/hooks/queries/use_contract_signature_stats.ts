import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.getSignatureStats')

export type ContractSignatureStatsResponse = InferResponseType<typeof $route.$get>

export function useContractSignatureStatsQueryOptions(contractId: string) {
  const params = { contractId }

  return {
    queryKey: ['contracts', 'signature-stats', params],
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.getSignatureStats', params).$get().unwrap()
    },
  } satisfies QueryOptions<ContractSignatureStatsResponse>
}
