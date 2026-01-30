import { tuyau } from '../../lib/api'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { InferRequestType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.events.update')

type UpdateEventBody = InferRequestType<typeof $route.$put>

export function useUpdateEventMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...body }: UpdateEventBody & { id: string }) => {
      return tuyau.$route('api.v1.events.update', { id }).$put(body).unwrap()
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['events'] })
      queryClient.invalidateQueries({ queryKey: ['events', variables.id] })
    },
  })
}
