import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.posts.comments.store')

type CreateCommentParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']
type CreateCommentBody = NonNullable<Parameters<typeof $route.$post>[0]>

export function useCreateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, ...body }: CreateCommentBody & { params: CreateCommentParams }) => {
      return $route.$post({ params, ...body }).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.params.postId, 'comments'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
