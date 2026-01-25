import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.attendance.index')

export type AttendanceListResponse = InferResponseType<typeof $route.$get>

interface UseAttendanceListOptions {
  classId?: string
  studentId?: string
  date?: string
  status?: string
  page?: number
  limit?: number
}

export function useAttendanceListQueryOptions(options: UseAttendanceListOptions = {}) {
  const { page = 1, limit = 50, ...filters } = options

  return {
    queryKey: ['attendance', 'list', { page, limit, ...filters }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.attendance.index')
        .$get({ query: { page, limit, ...filters } })
        .unwrap()
    },
  } satisfies QueryOptions<AttendanceListResponse>
}
