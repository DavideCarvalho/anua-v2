import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.printRequests.showPrintRequest')

export type PrintRequestResponse = InferResponseType<typeof $route.$get>

type PrintRequestParams = NonNullable<Parameters<typeof $route.$get>[0]>['params']

export function usePrintRequestQueryOptions(params: PrintRequestParams) {
  return {
    queryKey: ['print-request', params],
    queryFn: () => {
      return tuyau.$route('api.v1.printRequests.showPrintRequest', params).$get().unwrap()
    },
  } satisfies QueryOptions<PrintRequestResponse>
}
