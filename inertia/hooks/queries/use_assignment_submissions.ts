import { queryOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.assignments.submissions')
export type AssignmentSubmissionsResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$get']
>

interface UseAssignmentSubmissionsOptions {
  assignmentId: string
  page?: number
  limit?: number
}

export function useAssignmentSubmissionsQueryOptions(options: UseAssignmentSubmissionsOptions) {
  const { assignmentId, page = 1, limit = 20 } = options

  return queryOptions({
    queryKey: ['assignment-submissions', { assignmentId, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.assignments.submissions', { id: assignmentId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!assignmentId,
  })
}
