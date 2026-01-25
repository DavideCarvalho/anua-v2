import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.interestConfig.show')

export type ContractInterestConfigResponse = InferResponseType<typeof $route.$get>

export function useContractInterestConfigQueryOptions(contractId: string) {
  return {
    queryKey: ['contract-interest-config', contractId],
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.interestConfig.show', { contractId }).$get({}).unwrap()
    },
    enabled: !!contractId,
  } satisfies QueryOptions<ContractInterestConfigResponse>
}
