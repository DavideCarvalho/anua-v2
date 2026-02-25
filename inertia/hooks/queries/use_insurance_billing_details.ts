import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.billings.show')
export type InsuranceBillingDetailsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useInsuranceBillingDetailsQueryOptions(billingId: string) {
  return queryOptions({
    queryKey: ['insurance', 'billings', billingId],
    queryFn: () => {
      return tuyau
        .$route('api.v1.insurance.billings.show', { billingId })
        .$get({ query: { billingId } })
        .unwrap()
    },
    enabled: !!billingId,
  })
}
