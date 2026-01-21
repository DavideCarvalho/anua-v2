import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.posts.like')

type LikePostParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']

export function useLikePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: LikePostParams) => {
      return $route.$post({ params }).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts', variables.id] })
    },
  })
}
