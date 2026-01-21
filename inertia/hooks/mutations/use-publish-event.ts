import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.events.publish')

type PublishEventParams = NonNullable<Parameters<typeof $route.$post>[0]>['params']

export function usePublishEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: PublishEventParams) => {
      return $route.$post({ params }).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
    },
  })
}
