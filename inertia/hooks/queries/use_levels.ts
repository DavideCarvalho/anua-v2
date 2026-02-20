import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.levels.index')
export type LevelsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseLevelsOptions {
  courseId?: string
  schoolId?: string
  academicPeriodId?: string
  search?: string
  page?: number
  limit?: number
}

export function useLevelsQueryOptions(options: UseLevelsOptions = {}) {
  const { courseId, schoolId, academicPeriodId, search, page = 1, limit = 50 } = options

  return {
    queryKey: ['levels', { courseId, schoolId, academicPeriodId, search, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.levels.index')
        .$get({ query: { courseId, schoolId, academicPeriodId, search, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<LevelsResponse>
}
