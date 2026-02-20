import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.$route('api.v1.storeInstallmentRules.store')
export type CreateStoreInstallmentRulePayload = InferRequestType<
  ReturnType<typeof resolveRoute>['$post']
>

export function useCreateStoreInstallmentRuleMutationOptions() {
  return {
    mutationFn: (data: CreateStoreInstallmentRulePayload) => {
      return tuyau.$route('api.v1.storeInstallmentRules.store').$post(data).unwrap()
    },
  } satisfies MutationOptions
}
