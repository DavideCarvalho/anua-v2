import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $updateRoute = tuyau.$route('api.v1.academicPeriods.updateAcademicPeriod')
type UpdateAcademicPeriodPayload = InferRequestType<typeof $updateRoute.$put>

export function useUpdateAcademicPeriodMutationOptions() {
  return {
    mutationFn: (payload: UpdateAcademicPeriodPayload) => {
      return $updateRoute.$put(payload).unwrap()
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
