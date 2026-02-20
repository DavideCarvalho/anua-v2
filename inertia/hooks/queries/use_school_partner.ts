import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type SchoolPartnerParams = Parameters<(typeof tuyau.api.v1)['school-partners']>[0]

const resolveRoute = () => tuyau.api.v1['school-partners']({ id: '' }).$get

export type SchoolPartnerResponse = InferResponseType<ReturnType<typeof resolveRoute>>

export function useSchoolPartnerQueryOptions(params: SchoolPartnerParams) {
  return {
    queryKey: ['school-partner', params],
    queryFn: () => {
      return tuyau.api.v1['school-partners'](params).$get().unwrap()
    },
  } satisfies QueryOptions<SchoolPartnerResponse>
}
