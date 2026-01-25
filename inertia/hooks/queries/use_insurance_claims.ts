import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.insurance.claims.index')

export type InsuranceClaimsResponse = InferResponseType<typeof $route.$get>

type InsuranceClaimsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useInsuranceClaimsQueryOptions(query?: InsuranceClaimsQuery) {
  const mergedQuery: InsuranceClaimsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['insurance', 'claims', mergedQuery],
    queryFn: () => {
      return $route.$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<InsuranceClaimsResponse>
}
