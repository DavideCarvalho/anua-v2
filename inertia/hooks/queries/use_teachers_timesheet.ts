import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.teachers.timesheet.$get

export type TeachersTimesheetResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type TeachersTimesheetQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useTeachersTimesheetQueryOptions(query: TeachersTimesheetQuery) {
  return {
    queryKey: ['teachers', 'timesheet', query],
    queryFn: () => {
      return resolveRoute()({ query }).unwrap()
    },
  } satisfies QueryOptions<TeachersTimesheetResponse>
}
