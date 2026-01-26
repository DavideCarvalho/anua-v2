import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

// Create Contract
const $createContractRoute = tuyau.$route('api.v1.contracts.store')
type CreateContractPayload = InferRequestType<typeof $createContractRoute.$post>

export function useCreateContractMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateContractPayload) => {
      return tuyau.$route('api.v1.contracts.store').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

// Update Contract
const $updateContractRoute = tuyau.$route('api.v1.contracts.update')
type UpdateContractPayload = InferRequestType<typeof $updateContractRoute.$put> & {
  id: string
}

export function useUpdateContractMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, ...data }: UpdateContractPayload) => {
      return tuyau.$route('api.v1.contracts.update', { id }).$put(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}

// Delete Contract
export function useDeleteContractMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (contractId: string) => {
      return tuyau.$route('api.v1.contracts.destroy', { id: contractId }).$delete().unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contracts'] })
    },
  })
}
