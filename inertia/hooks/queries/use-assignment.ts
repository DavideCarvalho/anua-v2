import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.assignments.show')

export type AssignmentResponse = InferResponseType<typeof $route.$get>

export function useAssignmentQueryOptions(id: string) {
  return {
    queryKey: ['assignment', id],
    queryFn: () => {
      return tuyau
        .$route('api.v1.assignments.show')
        .$get({ params: { id } })
        .unwrap()
    },
    enabled: !!id,
  } satisfies QueryOptions<AssignmentResponse>
}
