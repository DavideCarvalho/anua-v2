import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.courses.index')

export type CoursesResponse = InferResponseType<typeof $route.$get>

interface UseCoursesOptions {
  schoolId?: string
  search?: string
  page?: number
  limit?: number
}

export function useCoursesQueryOptions(options: UseCoursesOptions = {}) {
  const { schoolId, search, page = 1, limit = 50 } = options

  return {
    queryKey: ['courses', { schoolId, search, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.courses.index')
        .$get({ query: { schoolId, search, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<CoursesResponse>
}
