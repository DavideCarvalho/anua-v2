import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.api.v1['school-partners'].$get

export type SchoolPartnersResponse = InferResponseType<ReturnType<typeof resolveRoute>>

type SchoolPartnersQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useSchoolPartnersQueryOptions(query: SchoolPartnersQuery = {}) {
  const mergedQuery: SchoolPartnersQuery = {
    page: 1,
    limit: 10,
    ...query,
  }

  return {
    queryKey: ['school-partners', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery }).unwrap()
    },
  } satisfies QueryOptions
}
