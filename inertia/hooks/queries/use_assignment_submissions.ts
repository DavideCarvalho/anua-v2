import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.assignments.submissions')

export type AssignmentSubmissionsResponse = InferResponseType<typeof $route.$get>

interface UseAssignmentSubmissionsOptions {
  assignmentId: string
  page?: number
  limit?: number
}

export function useAssignmentSubmissionsQueryOptions(options: UseAssignmentSubmissionsOptions) {
  const { assignmentId, page = 1, limit = 20 } = options

  return {
    queryKey: ['assignment-submissions', { assignmentId, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.assignments.submissions', { id: assignmentId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!assignmentId,
  } satisfies QueryOptions<AssignmentSubmissionsResponse>
}

export function useAssignmentSubmissions(options: UseAssignmentSubmissionsOptions) {
  return useSuspenseQuery(useAssignmentSubmissionsQueryOptions(options))
}
