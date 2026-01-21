import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.schoolChains.listSchoolChains')

export type SchoolChainsResponse = InferResponseType<typeof $route.$get>

interface UseSchoolChainsOptions {
  search?: string
  page?: number
  limit?: number
}

export function useSchoolChainsQueryOptions(options: UseSchoolChainsOptions = {}) {
  const { search, page = 1, limit = 20 } = options

  return {
    queryKey: ['school-chains', { search, page, limit }],
    queryFn: () => $route.$get({ query: { search, page, limit } }).unwrap(),
  } satisfies QueryOptions<SchoolChainsResponse>
}
