import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.earlyDiscounts.index')

export type ContractEarlyDiscountsResponse = InferResponseType<typeof $route.$get>

export function useContractEarlyDiscountsQueryOptions(contractId: string) {
  return {
    queryKey: ['contract-early-discounts', contractId],
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.earlyDiscounts.index', { contractId }).$get({}).unwrap()
    },
    enabled: !!contractId,
  } satisfies QueryOptions<ContractEarlyDiscountsResponse>
}
