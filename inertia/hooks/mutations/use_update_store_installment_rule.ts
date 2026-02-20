import type { MutationOptions } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveRoute = () => tuyau.resolveRoute()('api.v1.storeInstallmentRules.update')
export type UpdateStoreInstallmentRulePayload = InferRequestType<
  ReturnType<typeof resolveRoute>['$put']
> & {
  id: string
}

export function useUpdateStoreInstallmentRuleMutationOptions() {
  return {
    mutationFn: ({ id, ...data }: UpdateStoreInstallmentRulePayload) => {
      return tuyau.resolveRoute()('api.v1.storeInstallmentRules.update', { id }).$put(data).unwrap()
    },
  } satisfies MutationOptions
}
