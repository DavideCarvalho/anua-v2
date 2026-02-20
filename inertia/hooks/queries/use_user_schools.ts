import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.userSchools.listUserSchools')
export type UserSchoolsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseUserSchoolsOptions {
  userId?: string
  page?: number
  limit?: number
}

export function useUserSchoolsQueryOptions(options: UseUserSchoolsOptions = {}) {
  const { userId, page = 1, limit = 20 } = options

  return {
    queryKey: ['user-schools', { userId, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.userSchools.listUserSchools')
        .$get({ query: { userId, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<UserSchoolsResponse>
}

export function useUserSchools(options: UseUserSchoolsOptions = {}) {
  return useSuspenseQuery(useUserSchoolsQueryOptions(options))
}
