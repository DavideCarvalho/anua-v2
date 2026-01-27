import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.students({ id: '' }).enrollments.$get

export type StudentEnrollmentsResponse = InferResponseType<typeof $route>
export type StudentEnrollment = StudentEnrollmentsResponse[number]

export function useStudentEnrollmentsQueryOptions(studentId: string | null | undefined) {
  return {
    queryKey: ['student-enrollments', studentId],
    queryFn: async () => {
      if (!studentId) return []
      const response = await tuyau.api.v1.students({ id: studentId }).enrollments.$get()
      return response.data ?? []
    },
    enabled: !!studentId,
  } satisfies QueryOptions<StudentEnrollmentsResponse>
}
