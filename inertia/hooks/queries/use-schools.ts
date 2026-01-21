import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.schools.index')

export type SchoolsResponse = InferResponseType<typeof $route.$get>

interface UseSchoolsOptions {
  page?: number
  limit?: number
  search?: string
  includeUsers?: boolean
}

export function useSchoolsQueryOptions(options: UseSchoolsOptions = {}) {
  const { page = 1, limit = 20, search, includeUsers } = options

  return {
    queryKey: ['schools', { page, limit, search, includeUsers }],
    queryFn: () => $route.$get({ query: { page, limit, search, includeUsers } }).unwrap(),
  } satisfies QueryOptions<SchoolsResponse>
}
