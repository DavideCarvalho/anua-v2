import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.posts.comments.index')
export type PostCommentsResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function usePostCommentsQueryOptions(
  params: { postId: string },
  query: { page?: number; limit?: number } = {}
) {
  const mergedQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['posts', params.postId, 'comments', mergedQuery],
    queryFn: () => {
      return tuyau
        .$route('api.v1.posts.comments.index', { postId: params.postId })
        .$get({ query: mergedQuery } as any)
        .unwrap()
    },
    enabled: !!params.postId,
  }
}
