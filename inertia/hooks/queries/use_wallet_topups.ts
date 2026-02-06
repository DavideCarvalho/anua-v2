import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

const $listRoute = tuyau.$route('api.v1.responsavel.api.listWalletTopUps')

export type WalletTopUpsResponse = InferResponseType<typeof $listRoute.$get>

const $showRoute = tuyau.$route('api.v1.responsavel.api.showWalletTopUp')

export type WalletTopUpResponse = InferResponseType<typeof $showRoute.$get>

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
