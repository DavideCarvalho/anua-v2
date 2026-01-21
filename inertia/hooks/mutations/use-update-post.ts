import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.posts.update')

type UpdatePostParams = NonNullable<Parameters<typeof $route.$put>[0]>['params']
type UpdatePostBody = NonNullable<Parameters<typeof $route.$put>[0]>

export function useUpdatePostMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, ...body }: UpdatePostBody & { params: UpdatePostParams }) => {
      return $route.$put({ params, ...body }).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts'] })
      queryClient.invalidateQueries({ queryKey: ['posts', variables.params.id] })
    },
  })
}
