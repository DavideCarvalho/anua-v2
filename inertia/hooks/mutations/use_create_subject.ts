import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const resolveRoute = () => tuyau.api.v1.subjects.$post

type CreateSubjectBody = Parameters<ReturnType<typeof resolveRoute>>[0]

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateSubjectBody) => {
      return resolveRoute()(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}
