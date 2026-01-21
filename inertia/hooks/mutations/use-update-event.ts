import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'

const $route = tuyau.$route('api.v1.events.update')

type UpdateEventParams = NonNullable<Parameters<typeof $route.$put>[0]>['params']
type UpdateEventBody = NonNullable<Parameters<typeof $route.$put>[0]>

export function useUpdateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ params, ...body }: UpdateEventBody & { params: UpdateEventParams }) => {
      return $route.$put({ params, ...body }).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.params.id] })
    },
  })
}
