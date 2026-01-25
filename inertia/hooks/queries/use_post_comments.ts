import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.posts.comments.index')

export type PostCommentsResponse = InferResponseType<typeof $route.$get>

type PostCommentsParams = NonNullable<Parameters<typeof $route.$get>[0]>['params']
type PostCommentsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function usePostCommentsQueryOptions(
  params: PostCommentsParams,
  query: PostCommentsQuery = {}
) {
  const mergedQuery: PostCommentsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['posts', params.postId, 'comments', mergedQuery],
    queryFn: () => {
      return tuyau
        .$route('api.v1.posts.comments.index')
        .$get({ params, query: mergedQuery })
        .unwrap()
    },
    enabled: !!params.postId,
  } satisfies QueryOptions<PostCommentsResponse>
}
