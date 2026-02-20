import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const resolveListRoute = () => tuyau.$route('api.v1.responsavel.api.listWalletTopUps')
export type WalletTopUpsResponse = InferResponseType<ReturnType<typeof resolveListRoute>['$get']>

const resolveShowRoute = () => tuyau.$route('api.v1.responsavel.api.showWalletTopUp')
export type WalletTopUpResponse = InferResponseType<ReturnType<typeof resolveShowRoute>['$get']>

interface UseWalletTopUpsOptions {
  studentId: string
  page?: number
  limit?: number
}

export function useWalletTopUpsQueryOptions({
  studentId,
  page = 1,
  limit = 10,
}: UseWalletTopUpsOptions) {
  return {
    queryKey: ['responsavel', 'wallet-top-ups', studentId, { page, limit }],
    queryFn: () =>
      tuyau
        .$route('api.v1.responsavel.api.listWalletTopUps', { studentId })
        .$get({ query: { page, limit } })
        .unwrap(),
    enabled: !!studentId,
  }
}

export function useWalletTopUpQueryOptions(id: string) {
  return {
    queryKey: ['responsavel', 'wallet-top-up', id],
    queryFn: () => tuyau.$route('api.v1.responsavel.api.showWalletTopUp', { id }).$get().unwrap(),
    enabled: !!id,
  }
}
