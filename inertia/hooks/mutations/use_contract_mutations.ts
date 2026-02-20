import type { MutationOptions } from '@tanstack/react-query'
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

export function createContractMutationOptions(): MutationOptions<
  unknown,
  Error,
  CreateContractPayload
> {
  return {
    mutationFn: (data) => {
      return tuyau.$route('api.v1.contracts.store').$post(data).unwrap()
    },
  }
}

export function updateContractMutationOptions(): MutationOptions<
  unknown,
  Error,
  UpdateContractPayload
> {
  return {
    mutationFn: ({ id, ...data }) => {
      return tuyau.$route('api.v1.contracts.update', { id }).$put(data).unwrap()
    },
  }
}

export function deleteContractMutationOptions(): MutationOptions<unknown, Error, string> {
  return {
    mutationFn: (contractId) => {
      return tuyau.$route('api.v1.contracts.destroy', { id: contractId }).$delete().unwrap()
    },
  }
}
