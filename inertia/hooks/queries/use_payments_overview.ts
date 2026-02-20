import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.payments.overview')
export type PaymentsOverviewResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type PaymentsOverviewQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function usePaymentsOverviewQueryOptions(query: PaymentsOverviewQuery = {}) {
  return {
    queryKey: ['analytics', 'payments', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.payments.overview').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<PaymentsOverviewResponse>
}
