import { useQuery, useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.classes.show')
export type ClassResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useClassQueryOptions(classId: string) {
  return {
    queryKey: ['class', classId],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.classes.show', { id: classId }).$get().unwrap()
    },
    enabled: !!classId,
  }
}

export function useClass(classId: string) {
  return useSuspenseQuery(useClassQueryOptions(classId))
}

export function useClassQuery(classId: string) {
  return useQuery(useClassQueryOptions(classId))
}
