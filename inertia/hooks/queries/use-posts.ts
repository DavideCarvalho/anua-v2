import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.posts.index')

export type PostsResponse = InferResponseType<typeof $route.$get>

type PostsQuery = NonNullable<Parameters<typeof $route.$get>[0]>['query']

export function usePostsQueryOptions(query: PostsQuery = {}) {
  const mergedQuery: PostsQuery = {
    page: 1,
    limit: 20,
    ...query,
  }

  return {
    queryKey: ['posts', mergedQuery],
    queryFn: () => {
      return tuyau
        .$route('api.v1.posts.index')
        .$get({ query: mergedQuery })
        .unwrap()
    },
  } satisfies QueryOptions<PostsResponse>
}
