import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.students.show')
export type StudentResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useStudentQueryOptions(studentId: string) {
  return {
    queryKey: ['student', studentId],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.students.show', { id: studentId }).$get().unwrap()
    },
    enabled: !!studentId,
  }
}
