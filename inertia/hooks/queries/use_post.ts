import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.posts.show')
export type PostResponse = InferResponseType<ReturnType<typeof resolveRoute>['$get']>

export function usePostQueryOptions(params: { id: string }) {
  return {
    queryKey: ['posts', params.id],
    queryFn: () => {
      return tuyau.resolveRoute()('api.v1.posts.show', { id: params.id }).$get().unwrap()
    },
    enabled: !!params.id,
  }
}
