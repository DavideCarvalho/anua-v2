import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.contracts.paymentDays.index')

export type ContractPaymentDaysResponse = InferResponseType<typeof $route.$get>

export function useContractPaymentDaysQueryOptions(contractId: string) {
  return {
    queryKey: ['contract-payment-days', contractId],
    queryFn: () => {
      return tuyau
        .$route('api.v1.contracts.paymentDays.index', { contractId })
        .$get({})
        .unwrap()
    },
    enabled: !!contractId,
  } satisfies QueryOptions<ContractPaymentDaysResponse>
}
