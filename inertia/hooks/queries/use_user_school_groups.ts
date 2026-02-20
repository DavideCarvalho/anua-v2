import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.userSchoolGroups.listUserSchoolGroups')
export type UserSchoolGroupsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseUserSchoolGroupsOptions {
  userId?: string
  page?: number
  limit?: number
}

export function useUserSchoolGroupsQueryOptions(options: UseUserSchoolGroupsOptions = {}) {
  const { userId, page = 1, limit = 20 } = options

  return {
    queryKey: ['user-school-groups', { userId, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.userSchoolGroups.listUserSchoolGroups')
        .$get({ query: { userId, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<UserSchoolGroupsResponse>
}

export function useUserSchoolGroups(options: UseUserSchoolGroupsOptions = {}) {
  return useSuspenseQuery(useUserSchoolGroupsQueryOptions(options))
}
