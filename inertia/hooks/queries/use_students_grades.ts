import { tuyau } from '../../lib/api'
import { queryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.grades.students')
export type StudentsGradesResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

type StudentsGradesQuery = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$get']>[0]
>['query']

export function useStudentsGradesQueryOptions(query: StudentsGradesQuery = {}) {
  return queryOptions({
    queryKey: ['grades', 'students', query],
    queryFn: () => {
      return tuyau.$route('api.v1.grades.students').$get({ query }).unwrap()
    },
  })
}
