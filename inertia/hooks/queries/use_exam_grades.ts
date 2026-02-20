import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.exams.grades')
export type ExamGradesResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

interface UseExamGradesOptions {
  examId: string
  page?: number
  limit?: number
}

export function useExamGradesQueryOptions(options: UseExamGradesOptions) {
  const { examId, page = 1, limit = 50 } = options

  return {
    queryKey: ['exam-grades', { examId, page, limit }],
    queryFn: () => {
      return tuyau
        .resolveRoute()('api.v1.exams.grades', { id: examId })
        .$get({ query: { page, limit } })
        .unwrap()
    },
    enabled: !!examId,
  }
}

export function useExamGrades(options: UseExamGradesOptions) {
  return useSuspenseQuery(useExamGradesQueryOptions(options))
}
