import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.responsibleAddresses.show')
export type ResponsibleAddressResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function useResponsibleAddressQueryOptions(responsibleId: string) {
  return {
    queryKey: ['responsible-address', responsibleId],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.responsibleAddresses.show', { responsibleId })
        .$get()
        .unwrap()
    },
    enabled: !!responsibleId,
  }
}

export function useResponsibleAddress(responsibleId: string) {
  return useSuspenseQuery(useResponsibleAddressQueryOptions(responsibleId))
}
