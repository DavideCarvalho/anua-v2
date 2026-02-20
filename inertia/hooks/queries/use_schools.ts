import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

type SchoolsIndexRoute = ReturnType<typeof tuyau.$route<'api.v1.schools.index'>>
type SchoolsShowRoute = ReturnType<typeof tuyau.$route<'api.v1.schools.show'>>

export type SchoolsResponse = InferResponseType<SchoolsIndexRoute['$get']>
export type SchoolResponse = InferResponseType<SchoolsShowRoute['$get']>

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
    queryFn: () => {
      const route = tuyau.$route('api.v1.schools.index')
      return route.$get({ query: { page, limit, search, includeUsers } }).unwrap()
    },
  }
}

export function useSchoolQueryOptions(schoolId: string) {
  return {
    queryKey: ['school', schoolId],
    queryFn: () => {
      const route = tuyau.$route('api.v1.schools.show', { id: schoolId })
      return route.$get().unwrap()
    },
    enabled: !!schoolId,
  }
}
