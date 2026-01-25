import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.events.destroy')

type DeleteEventParams = NonNullable<Parameters<typeof $route.$delete>[0]>['params']

export function useDeleteEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (params: DeleteEventParams) => {
      return $route.$delete({ params }).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
    },
  })
}
