import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.posts.show')

export type PostResponse = InferResponseType<typeof $route.$get>

export function usePostQueryOptions(params: { id: string }) {
  return {
    queryKey: ['posts', params.id],
    queryFn: () => {
      return tuyau.$route('api.v1.posts.show', { id: params.id }).$get().unwrap()
    },
    enabled: !!params.id,
  }
}
