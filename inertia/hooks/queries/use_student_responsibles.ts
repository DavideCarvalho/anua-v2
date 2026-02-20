import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsibles.listByStudent')
export type StudentResponsiblesResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useStudentResponsiblesQueryOptions(studentId: string) {
  return {
    queryKey: ['student-responsibles', studentId],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.responsibles.listByStudent', { studentId })
        .$get()
        .unwrap()
    },
    enabled: !!studentId,
  }
}

export function useStudentResponsibles(studentId: string) {
  return useSuspenseQuery(useStudentResponsiblesQueryOptions(studentId))
}
