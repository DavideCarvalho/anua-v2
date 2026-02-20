import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.billings.show')
export type InsuranceBillingDetailsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

export function useInsuranceBillingDetailsQueryOptions(billingId: string) {
  return {
    queryKey: ['insurance', 'billings', billingId],
    queryFn: () => {
      return tuyau
        .$route('api.v1.insurance.billings.show', { billingId })
        .$get({} as any)
        .unwrap()
    },
    enabled: !!billingId,
  }
}
