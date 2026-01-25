import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.posts.destroy')

type DeletePostParams = NonNullable<Parameters<typeof $route.$delete>[0]>['params']

export function useDeletePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: DeletePostParams) => {
      return $route.$delete({ params }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
