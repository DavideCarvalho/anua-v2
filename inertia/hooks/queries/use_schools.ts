import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.schools.index')
const $showRoute = tuyau.$route('api.v1.schools.show')

export type SchoolsResponse = InferResponseType<typeof $route.$get>
export type SchoolResponse = InferResponseType<typeof $showRoute.$get>

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
  }
}

export function useSchoolQueryOptions(schoolId: string) {
  return {
    queryKey: ['school', schoolId],
    queryFn: () => (tuyau.api.v1.schools as any)({ id: schoolId }).$get().unwrap(),
    enabled: !!schoolId,
  }
}
