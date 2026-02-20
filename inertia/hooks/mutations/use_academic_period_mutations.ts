import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveUpdateRoute = () => tuyau.$route('api.v1.academicPeriods.updateAcademicPeriod')
type UpdateAcademicPeriodPayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']>

export function useUpdateAcademicPeriodMutationOptions() {
  return {
    mutationFn: (payload: UpdateAcademicPeriodPayload) => {
      return resolveUpdateRoute().$put(payload).unwrap()
    },
  } satisfies MutationOptions<unknown, Error, UpdateAcademicPeriodPayload>
}

export function useDeleteAcademicPeriodMutationOptions() {
  return {
    mutationFn: (id: string) => {
      return tuyau.api.v1['academic-periods']({ id }).$delete().unwrap()
    },
  } satisfies MutationOptions<unknown, Error, string>
}
