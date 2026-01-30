import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.posts.update')

type UpdatePostBody = InferRequestType<typeof $route.$put>

export function useUpdatePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdatePostBody & { id: string }) => {
      return tuyau.$route('api.v1.posts.update', { id }).$put(body).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts', variables.id] })
    },
  })
}
