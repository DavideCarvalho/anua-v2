import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.grades.students')

export type StudentsGradesResponse = InferResponseType<typeof $route.$get>

type StudentsGradesQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function useStudentsGradesQueryOptions(query: StudentsGradesQuery = {}) {
  return {
    queryKey: ['grades', 'students', query],
    queryFn: () => {
      return tuyau
        .$route('api.v1.grades.students')
        .$get({ query })
        .unwrap()
    },
  } satisfies QueryOptions<StudentsGradesResponse>
}
