import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.teachers.timesheet.$get

export type TeachersTimesheetResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type TeachersTimesheetQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useTeachersTimesheetQueryOptions(query: TeachersTimesheetQuery) {
  return queryOptions({
    queryKey: ['teachers', 'timesheet', query],
    queryFn: () => {
      return resolveRoute()({ query }).unwrap()
    },
  })
}
