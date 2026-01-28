import type { MutationOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'
import { tuyau } from '../../lib/api'

const $route = tuyau.$route('api.v1.attendance.batch')

export type BatchCreateAttendanceResponse = InferResponseType<typeof $route.$post>
export type BatchCreateAttendanceData = NonNullable<Parameters<typeof $route.$post>[0]>

export function useBatchCreateAttendanceMutationOptions() {
  return {
    mutationFn: (data: BatchCreateAttendanceData) => {
      return $route.$post(data).unwrap()
    },
  } satisfies MutationOptions<BatchCreateAttendanceResponse, Error, BatchCreateAttendanceData>
}
