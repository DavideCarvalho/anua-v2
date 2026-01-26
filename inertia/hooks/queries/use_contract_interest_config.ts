import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.interestConfig.show')

export type ContractInterestConfigResponse = InferResponseType<typeof $route.$get>

export function useContractInterestConfigQueryOptions(contractId: string) {
  return {
    queryKey: ['contract-interest-config', contractId] as const,
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.interestConfig.show', { contractId }).$get({}).unwrap()
    },
    enabled: !!contractId,
  }
}
