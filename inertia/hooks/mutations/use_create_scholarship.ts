import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.api.v1.scholarships.$post

type CreateScholarshipBody = Parameters<ReturnType<typeof resolveRoute>>[0]

export function useCreateScholarshipMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateScholarshipBody) => {
      return resolveRoute()(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
    },
  })
}
