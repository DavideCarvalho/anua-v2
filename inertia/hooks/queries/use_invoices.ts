import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1.invoices.$get

export type InvoicesResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type InvoicesQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useInvoicesQueryOptions(query: InvoicesQuery = {}) {
  const mergedQuery: InvoicesQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['invoices', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
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
