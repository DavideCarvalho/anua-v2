import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.responsibleAddresses.create')
type CreateResponsibleAddressPayload = InferRequestType<typeof $createRoute.$post> & { responsibleId: string }

export function useCreateResponsibleAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ responsibleId, ...data }: CreateResponsibleAddressPayload) => {
      return tuyau.$route('api.v1.responsibleAddresses.create', { responsibleId }).$post(data).unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['responsible-address', variables.responsibleId] })
    },
  })
}
