import { queryOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.classes.show')
export type ClassResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useClassQueryOptions(classId: string) {
  return queryOptions({
    queryKey: ['class', classId],
    queryFn: () => {
      return tuyau.$route('api.v1.classes.show', { id: classId }).$get().unwrap()
    },
    enabled: !!classId,
  })
}
