import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.schedules.getClassSchedule')
export type ClassScheduleResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useClassScheduleQueryOptions(
  classId: string,
  query: { academicPeriodId?: string } = {}
) {
  return {
    queryKey: ['classSchedule', classId, query],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.schedules.getClassSchedule', { classId })
        .$get({ query })
        .unwrap()
    },
    enabled: !!classId,
  } satisfies QueryOptions
}
