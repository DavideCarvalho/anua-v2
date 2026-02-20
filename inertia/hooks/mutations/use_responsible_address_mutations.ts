import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.responsibleAddresses.create')
type CreateResponsibleAddressPayload = InferRequestType<
  ReturnType<typeof resolveCreateRoute>['$post']
> & {
  responsibleId: string
}

export function useCreateResponsibleAddress() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ responsibleId, ...data }: CreateResponsibleAddressPayload) => {
      return tuyau
        .$route('api.v1.responsibleAddresses.create', { responsibleId } as any)
        .$post(data as any)
        .unwrap()
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['responsible-address', variables.responsibleId] })
    },
  })
}
