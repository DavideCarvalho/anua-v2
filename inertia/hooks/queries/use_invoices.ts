import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.invoices.$get

export type InvoicesResponse = InferResponseType<typeof $route>

type InvoicesQuery = NonNullable<Parameters<typeof $route>[0]>['query']

export function useInvoicesQueryOptions(query: InvoicesQuery = {}) {
  const mergedQuery: InvoicesQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['invoices', mergedQuery],
    queryFn: () => {
      return $route({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}

export function useStudentPendingInvoicesQueryOptions(studentId: string | undefined) {
  return {
    queryKey: ['student-pending-invoices', studentId],
    queryFn: () => {
      return tuyau.api.v1.invoices
        .$get({
          query: {
            studentId,
            limit: 100,
          },
        })
        .unwrap()
    },
    enabled: !!studentId,
  }
}
