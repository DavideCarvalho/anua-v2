import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.contracts.paymentDays.index')
export type ContractPaymentDaysResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useContractPaymentDaysQueryOptions(contractId: string) {
  return {
    queryKey: ['contract-payment-days', contractId] as const,
    queryFn: () => {
      return tuyau.$route('api.v1.contracts.paymentDays.index', { contractId }).$get({}).unwrap()
    },
    enabled: !!contractId,
  }
}
