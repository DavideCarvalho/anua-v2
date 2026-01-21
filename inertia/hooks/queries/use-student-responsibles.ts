import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsibles.listByStudent')

export type StudentResponsiblesResponse = InferResponseType<typeof $route.$get>

export function useStudentResponsiblesQueryOptions(studentId: string) {
  return {
    queryKey: ['student-responsibles', studentId],
    queryFn: () => {
      return tuyau
        .$route('api.v1.responsibles.listByStudent', { studentId })
        .$get()
        .unwrap()
    },
    enabled: !!studentId,
  } satisfies QueryOptions<StudentResponsiblesResponse>
}

export function useStudentResponsibles(studentId: string) {
  return useSuspenseQuery(useStudentResponsiblesQueryOptions(studentId))
}
