import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.analytics.attendance.trends')

export type AttendanceTrendsResponse = InferResponseType<typeof $route.$get>

type AttendanceTrendsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useAttendanceTrendsQueryOptions(query: AttendanceTrendsQuery = {}) {
  return {
    queryKey: ['analytics', 'attendance', 'trends', query],
    queryFn: () => {
      return tuyau.$route('api.v1.analytics.attendance.trends').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<AttendanceTrendsResponse>
}
