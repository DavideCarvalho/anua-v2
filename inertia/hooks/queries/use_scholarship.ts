import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type ScholarshipParams = Parameters<typeof tuyau.api.v1.scholarships>[0]

const resolveRoute = () => tuyau.api.v1.scholarships({ id: '' }).$get

export type ScholarshipResponse = InferResponseType<ReturnType<typeof resolveRoute>>

export function useScholarshipQueryOptions(params: ScholarshipParams) {
  return queryOptions({
    queryKey: ['scholarship', params],
    queryFn: () => {
      return tuyau.api.v1.scholarships(params).$get().unwrap()
    },
  })
}
