import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.billings.show')

export type InsuranceBillingDetailsResponse = InferResponseType<typeof $route.$get>

export function useInsuranceBillingDetailsQueryOptions(billingId: string) {
  return {
    queryKey: ['insurance', 'billings', billingId],
    queryFn: () => {
      return $route.$get({ params: { billingId } }).unwrap()
    },
    enabled: !!billingId,
  } satisfies QueryOptions<InsuranceBillingDetailsResponse>
}
