import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.api.v1.scholarships.$post

type CreateScholarshipBody = Parameters<typeof $route>[0]

export function useCreateScholarshipMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (body: CreateScholarshipBody) => {
      return $route(body).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scholarships'] })
    },
  })
}
