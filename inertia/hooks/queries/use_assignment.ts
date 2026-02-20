import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type SerializedResponse<T> = T extends { serialize: () => infer U }
  ? U
  : T extends { toJSON: () => infer U }
    ? U
    : T

type AssignmentParams = Parameters<typeof tuyau.api.v1.assignments>[0]

const resolveRoute = () => tuyau.api.v1.assignments({ id: '' }).$get

export type AssignmentResponse = InferResponseType<ReturnType<typeof resolveRoute>>
export type AssignmentData = SerializedResponse<AssignmentResponse>

export function useAssignmentQueryOptions(params: AssignmentParams) {
  return {
    queryKey: ['assignment', params],
    queryFn: () => {
      return tuyau.api.v1
        .assignments(params)
        .$get()
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
          return response as AssignmentData
        })
    },
  } satisfies QueryOptions<AssignmentData>
}
