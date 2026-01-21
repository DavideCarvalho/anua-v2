import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $updateRoute = tuyau.$route('api.v1.academicPeriods.updateAcademicPeriod')
type UpdateAcademicPeriodPayload = InferRequestType<typeof $updateRoute.$put> & { id: string }

export function useUpdateAcademicPeriod() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateAcademicPeriodPayload) => {
      return tuyau.$route('api.v1.academicPeriods.updateAcademicPeriod', { id }).$put(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['academic-period', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    },
  })
}
