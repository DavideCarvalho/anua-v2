import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.assignments.index')

export type AssignmentsResponse = InferResponseType<typeof $route.$get>

interface UseAssignmentsOptions {
  classId?: string
  subjectId?: string
  teacherId?: string
  status?: string
  page?: number
  limit?: number
}

export function useAssignmentsQueryOptions(options: UseAssignmentsOptions = {}) {
  const { page = 1, limit = 20, ...filters } = options

  return {
    queryKey: ['assignments', { page, limit, ...filters }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.assignments.index')
        .$get({ query: { page, limit, ...filters } })
        .unwrap()
    },
  } satisfies QueryOptions<AssignmentsResponse>
}
