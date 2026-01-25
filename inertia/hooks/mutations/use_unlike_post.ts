import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.posts.unlike')

type UnlikePostParams = NonNullable<Parameters<typeof $route.$delete>[0]>['params']

export function useUnlikePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: UnlikePostParams) => {
      return $route.$delete({ params }).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts', variables.id] })
    },
  })
}
