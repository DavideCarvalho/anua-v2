import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.insurance.billings.index')
export type InsuranceBillingsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type InsuranceBillingsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useInsuranceBillingsQueryOptions(query?: InsuranceBillingsQuery) {
  const mergedQuery: InsuranceBillingsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return queryOptions({
    queryKey: ['insurance', 'billings', mergedQuery],
    queryFn: () => {
      return resolveRoute().$get({ query: mergedQuery }).unwrap()
    },
  })
}
