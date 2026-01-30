import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.billings.show')

export type InsuranceBillingDetailsResponse = InferResponseType<typeof $route.$get>

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
