import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.grades.students')
export type StudentsGradesResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type StudentsGradesQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useStudentsGradesQueryOptions(query: StudentsGradesQuery = {} as any) {
  return {
    queryKey: ['grades', 'students', query],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.grades.students').$get({ query }).unwrap()
    },
  } satisfies QueryOptions<StudentsGradesResponse>
}
