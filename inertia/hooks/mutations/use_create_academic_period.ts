import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.api.v1['academic-periods'].$post

type CreateAcademicPeriodBody = Parameters<ReturnType<typeof resolveRoute>>[0]

export function useCreateAcademicPeriodMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateAcademicPeriodBody) => {
      return resolveRoute()(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['academic-periods'] })
    },
  })
}
