import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.claims.index')
export type InsuranceClaimsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type InsuranceClaimsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useInsuranceClaimsQueryOptions(query?: InsuranceClaimsQuery) {
  const mergedQuery: InsuranceClaimsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['insurance', 'claims', mergedQuery],
    queryFn: () => {
      return resolveRoute().$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<InsuranceClaimsResponse>
}
