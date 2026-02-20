import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type SerializedResponse<T> = T extends { serialize: () => infer U }
  ? U
  : T extends { toJSON: () => infer U }
    ? U
    : T

const resolveRoute = () => tuyau.api.v1.assignments.$get

export type AssignmentsResponse = InferResponseType<ReturnType<typeof resolveRoute>>
export type AssignmentsData = SerializedResponse<AssignmentsResponse>

type AssignmentsQuery = NonNullable<Parameters<ReturnType<typeof resolveRoute>>[0]>['query']

export function useAssignmentsQueryOptions(query: AssignmentsQuery = {}) {
  const mergedQuery: AssignmentsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['assignments', mergedQuery],
    queryFn: () => {
      return resolveRoute()({ query: mergedQuery })
        .unwrap()
        .then((response) => {
          if (response && typeof response === 'object') {
            if ('serialize' in response && typeof response.serialize === 'function') {
              return response.serialize()
            }
            if ('toJSON' in response && typeof response.toJSON === 'function') {
              return response.toJSON()
            }
          }
          return response as unknown as AssignmentsData
        })
    },
  } satisfies QueryOptions<AssignmentsData>
}
