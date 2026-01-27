import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsavel.api.studentGrades')

export type StudentGradesResponse = InferResponseType<typeof $route.$get>

export function useStudentGradesQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'student-grades', studentId],
    queryFn: () => {
      return tuyau.$route('api.v1.responsavel.api.studentGrades', { studentId }).$get().unwrap()
    },
  } satisfies QueryOptions<StudentGradesResponse>
}
