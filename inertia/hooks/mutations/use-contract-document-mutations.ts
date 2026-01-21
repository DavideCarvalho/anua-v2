import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const $createRoute = tuyau.$route('api.v1.contractDocuments.store')
type CreateContractDocumentPayload = InferRequestType<typeof $createRoute.$post>

export function useCreateContractDocument() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContractDocumentPayload) => {
      return tuyau.$route('api.v1.contractDocuments.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contract-documents'] })
    },
  })
}
