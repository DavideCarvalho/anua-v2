import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.printRequests.listPrintRequests')
export type PrintRequestsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type PrintRequestsQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function usePrintRequestsQueryOptions(query: PrintRequestsQuery = {}) {
  const mergedQuery: PrintRequestsQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['print-requests', mergedQuery],
    queryFn: () => {
      return tuyau
        .$route('api.v1.printRequests.listPrintRequests')
        .$get({ query: mergedQuery })
        .unwrap()
    },
  } satisfies QueryOptions<PrintRequestsResponse>
}
