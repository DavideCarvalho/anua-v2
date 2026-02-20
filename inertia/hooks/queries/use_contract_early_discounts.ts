import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.contracts.earlyDiscounts.index')
export type ContractEarlyDiscountsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useContractEarlyDiscountsQueryOptions(contractId: string) {
  return {
    queryKey: ['contract-early-discounts', contractId] as const,
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.contracts.earlyDiscounts.index', { contractId })
        .$get({})
        .unwrap()
    },
    enabled: !!contractId,
  }
}
