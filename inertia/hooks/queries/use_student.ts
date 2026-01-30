import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.students.show')

export type StudentResponse = InferResponseType<typeof $route.$get>

export function useStudentQueryOptions(studentId: string) {
  return {
    queryKey: ['student', studentId],
    queryFn: () => {
      return tuyau.$route('api.v1.students.show', { id: studentId }).$get().unwrap()
    },
    enabled: !!studentId,
  }
}
