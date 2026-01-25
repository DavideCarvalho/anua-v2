import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.api.v1['academic-periods'].$post

type CreateAcademicPeriodBody = Parameters<typeof $route>[0]

export function useCreateAcademicPeriodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateAcademicPeriodBody) => {
      return $route(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    },
  })
}
