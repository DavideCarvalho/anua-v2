import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveUpdateRoute = () => tuyau.$route('api.v1.academicPeriods.updateAcademicPeriod')
type UpdateAcademicPeriodPayload = InferRequestType<ReturnType<typeof resolveUpdateRoute>['$put']>

export function useUpdateAcademicPeriodMutationOptions() {
  return mutationOptions({
    mutationFn: (payload: UpdateAcademicPeriodPayload) => {
      return resolveUpdateRoute().$put(payload).unwrap()
    },
  })
}

export function useDeleteAcademicPeriodMutationOptions() {
  return mutationOptions({
    mutationFn: (id: string) => {
      return tuyau.api.v1['academic-periods']({ id }).$delete().unwrap()
    },
  })
}
