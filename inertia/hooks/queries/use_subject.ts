import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type SubjectParams = Parameters<typeof tuyau.api.v1.subjects>[0]

const $route = tuyau.api.v1.subjects({ id: '' }).$get

export type SubjectResponse = InferResponseType<typeof $route>

export function useSubjectQueryOptions(params: SubjectParams) {
  return {
    queryKey: ['subject', params],
    queryFn: () => {
      return tuyau.api.v1.subjects(params).$get().unwrap()
    },
  } satisfies QueryOptions<SubjectResponse>
}
