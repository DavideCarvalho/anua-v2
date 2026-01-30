import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useCreateCommentMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { postId: string; content: string; parentCommentId?: string }) => {
      const { postId, ...body } = data
      return tuyau
        .$route('api.v1.posts.comments.store', { postId })
        .$post(body as any)
        .unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['posts', variables.postId, 'comments'] })
      queryClient.invalidateQueries({ queryKey: ['posts'] })
    },
  })
}
