import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.hr.overview')
export type HrOverviewResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type HrOverviewQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>['$get']>[0]>['query']

export function useHrOverviewQueryOptions(query: HrOverviewQuery = {}) {
  return queryOptions({
    queryKey: ['analytics', 'hr', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.hr.overview').$get({ query }).unwrap()
    },
  })
}
