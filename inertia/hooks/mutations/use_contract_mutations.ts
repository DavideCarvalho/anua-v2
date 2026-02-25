import { mutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateContractRoute = () => tuyau.$route('api.v1.contracts.store')
type CreateContractPayload = InferRequestType<
  ReturnType<typeof resolveCreateContractRoute>['$post']
>

const resolveUpdateContractRoute = () => tuyau.$route('api.v1.contracts.update')
type UpdateContractPayload = InferRequestType<
  ReturnType<typeof resolveUpdateContractRoute>['$put']
> & {
  id: string
}

export function createContractMutationOptions() {
  return mutationOptions({
    mutationFn: (data: CreateContractPayload) => {
      return tuyau.$route('api.v1.contracts.store').$post(data).unwrap()
    },
  })
}

export function updateContractMutationOptions() {
  return mutationOptions({
    mutationFn: ({ id, ...data }: UpdateContractPayload) => {
      return tuyau.$route('api.v1.contracts.update', { id }).$put(data).unwrap()
    },
  })
}

export function deleteContractMutationOptions() {
  return mutationOptions({
    mutationFn: (contractId: string) => {
      return tuyau.$route('api.v1.contracts.destroy', { id: contractId }).$delete().unwrap()
    },
  })
}
