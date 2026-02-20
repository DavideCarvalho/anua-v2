import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['school-partners'].$get

export type SchoolPartnersForSelectResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type SchoolPartnersQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useSchoolPartnersForSelectQueryOptions(query: SchoolPartnersQuery = {}) {
  // For select we usually want all, but keep pagination defaults.
  const mergedQuery: SchoolPartnersQuery = {
    page: 1,
    limit: 100,
    ...query,
  }

  return {
    queryKey: ['school-partners', 'select', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions<SchoolPartnersForSelectResponse>
}
