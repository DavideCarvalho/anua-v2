import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.posts.show')

export type PostResponse = InferResponseType<typeof $route.$get>

type PostParams = NonNullable<Parameters<typeof $route.$get>[0]>['params']

export function usePostQueryOptions(params: PostParams) {
  return {
    queryKey: ['posts', params.id],
    queryFn: () => {
      return tuyau
        .$route('api.v1.posts.show')
        .$get({ params })
        .unwrap()
    },
    enabled: !!params.id,
  } satisfies QueryOptions<PostResponse>
}
