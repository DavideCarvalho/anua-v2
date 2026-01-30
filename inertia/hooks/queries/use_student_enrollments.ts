import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.students.enrollments.list')

export type StudentEnrollmentsResponse = InferResponseType<typeof $route.$get>
export type StudentEnrollment = StudentEnrollmentsResponse extends Array<infer T> ? T : never

export function useStudentEnrollmentsQueryOptions(studentId: string | null | undefined) {
  return {
    queryKey: ['student-enrollments', studentId],
    queryFn: async () => {
      if (!studentId) return []
      return tuyau.$route('api.v1.students.enrollments.list', { id: studentId }).$get().unwrap()
    },
    enabled: !!studentId,
  }
}
