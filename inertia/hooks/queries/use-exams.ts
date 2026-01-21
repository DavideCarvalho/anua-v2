import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.exams.index')

export type ExamsResponse = InferResponseType<typeof $route.$get>

interface UseExamsOptions {
  classId?: string
  subjectId?: string
  teacherId?: string
  status?: string
  page?: number
  limit?: number
}

export function useExamsQueryOptions(options: UseExamsOptions = {}) {
  const { page = 1, limit = 20, ...filters } = options

  return {
    queryKey: ['exams', { page, limit, ...filters }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.exams.index')
        .$get({ query: { page, limit, ...filters } })
        .unwrap()
    },
  } satisfies QueryOptions<ExamsResponse>
}
