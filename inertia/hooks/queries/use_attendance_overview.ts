import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.attendance.overview')
export type AttendanceOverviewResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type AttendanceOverviewQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useAttendanceOverviewQueryOptions(query: AttendanceOverviewQuery = {}) {
  return queryOptions({
    queryKey: ['analytics', 'attendance', 'overview', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.attendance.overview').$get({ query }).unwrap()
    },
  })
}
