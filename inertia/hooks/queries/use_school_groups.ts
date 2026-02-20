import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.schoolGroups.listSchoolGroups')
export type SchoolGroupsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseSchoolGroupsOptions {
  schoolChainId?: string
  search?: string
  page?: number
  limit?: number
}

export function useSchoolGroupsQueryOptions(options: UseSchoolGroupsOptions = {}) {
  const { schoolChainId, search, page = 1, limit = 20 } = options

  return {
    queryKey: ['school-groups', { schoolChainId, search, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.schoolGroups.listSchoolGroups')
        .$get({ query: { schoolChainId, search, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<SchoolGroupsResponse>
}
