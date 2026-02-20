import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.schoolChains.listSchoolChains')
export type SchoolChainsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseSchoolChainsOptions {
  search?: string
  page?: number
  limit?: number
}

export function useSchoolChainsQueryOptions(options: UseSchoolChainsOptions = {}) {
  const { search, page = 1, limit = 20 } = options

  return {
    queryKey: ['school-chains', { search, page, limit }],
    queryFn: () => resolveRoute().$get({ query: { search, page, limit } }).unwrap(),
  } satisfies QueryOptions<SchoolChainsResponse>
}
