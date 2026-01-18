import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.api.v1.subjects.$post

type CreateSubjectBody = Parameters<typeof $route>[0]

export function useCreateSubjectMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateSubjectBody) => {
      return $route(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['subjects'] })
    },
  })
}
