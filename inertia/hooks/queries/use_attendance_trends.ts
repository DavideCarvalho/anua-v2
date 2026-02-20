import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.analytics.attendance.trends')
export type AttendanceTrendsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type AttendanceTrendsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useAttendanceTrendsQueryOptions(query: AttendanceTrendsQuery = {}) {
  return {
    queryKey: ['analytics', 'attendance', 'trends', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.attendance.trends').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<AttendanceTrendsResponse>
}
