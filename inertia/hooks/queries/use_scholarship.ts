import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type ScholarshipParams = Parameters<typeof tuyau.api.v1.scholarships>[0]

const $route = tuyau.api.v1.scholarships({ id: '' }).$get

export type ScholarshipResponse = InferResponseType<typeof $route>

export function useScholarshipQueryOptions(params: ScholarshipParams) {
  return {
    queryKey: ['scholarship', params],
    queryFn: () => {
      return tuyau.api.v1.scholarships(params).$get().unwrap()
    },
  } satisfies QueryOptions<ScholarshipResponse>
}
