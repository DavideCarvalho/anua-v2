import { useQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.attendance.availableDates')
export type AttendanceAvailableDatesResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>
type AttendanceAvailableDatesQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useAttendanceAvailableDatesQueryOptions(query: AttendanceAvailableDatesQuery) {
  return {
    queryKey: ['attendance-available-dates', query],
    queryFn: () => {
      return resolveRoute().$get({ query }).unwrap()
    },
    enabled: !!query?.classId && !!query?.academicPeriodId && !!query?.subjectId,
  }
}

export function useAttendanceAvailableDates(query: AttendanceAvailableDatesQuery) {
  return useQuery(useAttendanceAvailableDatesQueryOptions(query))
}
