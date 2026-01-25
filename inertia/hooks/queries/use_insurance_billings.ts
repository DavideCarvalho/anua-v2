import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.billings.index')

export type InsuranceBillingsResponse = InferResponseType<typeof $route.$get>

type InsuranceBillingsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useInsuranceBillingsQueryOptions(query?: InsuranceBillingsQuery) {
  const mergedQuery: InsuranceBillingsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['insurance', 'billings', mergedQuery],
    queryFn: () => {
      return $route.$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<InsuranceBillingsResponse>
}
