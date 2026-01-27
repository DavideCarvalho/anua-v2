import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentSchedule')

export type StudentScheduleResponse = InferResponseType<typeof $route.$get>

export function useStudentScheduleQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'schedule'],
    queryFn: () => {
      return tuyau.$route('api.v1.responsavel.api.studentSchedule', { studentId }).$get().unwrap()
    },
  } satisfies QueryOptions<StudentScheduleResponse>
}
