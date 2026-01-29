import { useQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.attendance.availableDates')

export type AttendanceAvailableDatesResponse = InferResponseType<typeof $route.$get>
type AttendanceAvailableDatesQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useAttendanceAvailableDatesQueryOptions(query: AttendanceAvailableDatesQuery) {
  return {
    queryKey: ['attendance-available-dates', query],
    queryFn: () => {
      return $route.$get({ query }).unwrap()
    },
    enabled: !!query?.classId && !!query?.academicPeriodId && !!query?.subjectId,
  } satisfies QueryOptions<AttendanceAvailableDatesResponse>
}

export function useAttendanceAvailableDates(query: AttendanceAvailableDatesQuery) {
  return useQuery(useAttendanceAvailableDatesQueryOptions(query))
}
