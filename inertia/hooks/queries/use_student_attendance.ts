import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsavel.api.studentAttendance')
export type StudentAttendanceResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseStudentAttendanceOptions {
  studentId: string
  page?: number
  limit?: number
}

export function useStudentAttendanceQueryOptions({
  studentId,
  page = 1,
  limit = 20,
}: UseStudentAttendanceOptions) {
  return {
    queryKey: ['responsavel', 'student-attendance', studentId, { page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.responsavel.api.studentAttendance', { studentId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!studentId,
  }
}
