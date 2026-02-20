import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsavel.api.studentSchedule')
export type StudentScheduleResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useStudentScheduleQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'schedule'],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.responsavel.api.studentSchedule', { studentId })
        .$get()
        .unwrap()
    },
  } satisfies QueryOptions<StudentScheduleResponse>
}
