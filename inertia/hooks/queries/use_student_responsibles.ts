import { queryOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.responsibles.listByStudent')
export type StudentResponsiblesResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useStudentResponsiblesQueryOptions(studentId: string) {
  return queryOptions({
    queryKey: ['student-responsibles', studentId],
    queryFn: () => {
      return tuyau.$route('api.v1.responsibles.listByStudent', { studentId }).$get().unwrap()
    },
    enabled: !!studentId,
  })
}
