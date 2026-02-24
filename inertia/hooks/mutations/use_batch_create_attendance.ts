import { mutationOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'
import { tuyau } from '../../lib/api'

const resolveRoute = () => tuyau.$route('api.v1.attendance.batch')
export type BatchCreateAttendanceResponse = InferResponseType<
  ReturnType<typeof resolveRoute>['$post']
>
export type BatchCreateAttendanceData = NonNullable<
  Parameters<ReturnType<typeof resolveRoute>['$post']>[0]
>

export function useBatchCreateAttendanceMutationOptions() {
  return mutationOptions({
    mutationFn: (data: BatchCreateAttendanceData) => {
      return resolveRoute().$post(data).unwrap()
    },
  })
}
