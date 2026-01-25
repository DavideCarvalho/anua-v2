import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.responsibleAddresses.show')

export type ResponsibleAddressResponse = InferResponseType<typeof $route.$get>

export function useResponsibleAddressQueryOptions(responsibleId: string) {
  return {
    queryKey: ['responsible-address', responsibleId],
    queryFn: () => {
      return tuyau.$route('api.v1.responsibleAddresses.show', { responsibleId }).$get().unwrap()
    },
    enabled: !!responsibleId,
  } satisfies QueryOptions<ResponsibleAddressResponse>
}

export function useResponsibleAddress(responsibleId: string) {
  return useSuspenseQuery(useResponsibleAddressQueryOptions(responsibleId))
}
