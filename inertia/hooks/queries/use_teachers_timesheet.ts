import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.teachers.timesheet.$get

export type TeachersTimesheetResponse = InferResponseType<typeof $route>

type TeachersTimesheetQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useTeachersTimesheetQueryOptions(query: TeachersTimesheetQuery) {
  return {
    queryKey: ['teachers', 'timesheet', query],
    queryFn: () => {
      return $route({ query }).unwrap()
    },
  } satisfies QueryOptions<TeachersTimesheetResponse>
}
