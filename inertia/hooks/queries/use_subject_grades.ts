import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.grades.classSubject')

export type SubjectGradesResponse = InferResponseType<typeof $route.$get>

interface UseSubjectGradesOptions {
  classId: string
  subjectId: string
  courseId: string
  academicPeriodId: string
}

export function useSubjectGradesQueryOptions(options: UseSubjectGradesOptions) {
  const { classId, subjectId, courseId, academicPeriodId } = options

  return {
    queryKey: ['subject-grades', { classId, subjectId, courseId, academicPeriodId }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.grades.classSubject', { classId, subjectId })
        .$get({ query: { courseId, academicPeriodId } })
        .unwrap()
    },
    enabled: !!classId && !!subjectId && !!courseId && !!academicPeriodId,
  } satisfies QueryOptions
}
