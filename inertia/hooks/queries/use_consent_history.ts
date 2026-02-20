import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.consents.history')
export type ConsentHistoryResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type ConsentHistoryQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useConsentHistoryQueryOptions(query: ConsentHistoryQuery = {}) {
  const mergedQuery: ConsentHistoryQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['parental-consents', 'history', mergedQuery],
    queryFn: () => {
      return resolveRoute().$get({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<ConsentHistoryResponse>
}
