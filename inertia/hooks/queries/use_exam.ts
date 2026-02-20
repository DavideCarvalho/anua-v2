import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

type SerializedResponse<T> = T extends { serialize: () => infer U }
  ? U
  : T extends { toJSON: () => infer U }
    ? U
    : T

type ExamParams = Parameters<typeof tuyau.api.v1.exams>[0]

const resolveRoute = () => tuyau.api.v1.exams({ id: '' }).$get

export type ExamResponse = InferResponseType<ReturnType<typeof resolveRoute>>
export type ExamData = SerializedResponse<ExamResponse>

export function useExamQueryOptions(params: ExamParams) {
  return {
    queryKey: ['exam', params],
    queryFn: () => {
      return tuyau.api.v1
        .exams(params)
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
          return response as ExamData
        })
    },
  } satisfies QueryOptions<ExamData>
}
