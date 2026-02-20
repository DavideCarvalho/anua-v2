import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.printRequests.showPrintRequest')
export type PrintRequestResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function usePrintRequestQueryOptions(params: { id: string }) {
  return {
    queryKey: ['print-request', params],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.printRequests.showPrintRequest', params).$get().unwrap()
    },
  } satisfies QueryOptions<PrintRequestResponse>
}
