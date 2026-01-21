import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.studentBalanceTransactions.index')

export type StudentBalanceTransactionsResponse = InferResponseType<typeof $route.$get>

interface UseStudentBalanceTransactionsOptions {
  studentId?: string
  type?: 'CREDIT' | 'DEBIT'
  page?: number
  limit?: number
}

export function useStudentBalanceTransactionsQueryOptions(options: UseStudentBalanceTransactionsOptions = {}) {
  const { studentId, type, page = 1, limit = 20 } = options

  return {
    queryKey: ['student-balance-transactions', { studentId, type, page, limit }],
    queryFn: () => {
      return tuyau
        .$route('api.v1.studentBalanceTransactions.index')
        .$get({ query: { studentId, type, page, limit } })
        .unwrap()
    },
  } satisfies QueryOptions<StudentBalanceTransactionsResponse>
}

export function useStudentBalanceTransactions(options: UseStudentBalanceTransactionsOptions = {}) {
  return useSuspenseQuery(useStudentBalanceTransactionsQueryOptions(options))
}

// Get single transaction
const $showRoute = tuyau.$route('api.v1.studentBalanceTransactions.show')

export type StudentBalanceTransactionResponse = InferResponseType<typeof $showRoute.$get>

export function useStudentBalanceTransactionQueryOptions(id: string) {
  return {
    queryKey: ['student-balance-transaction', id],
    queryFn: () => {
      return tuyau.$route('api.v1.studentBalanceTransactions.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  } satisfies QueryOptions<StudentBalanceTransactionResponse>
}

export function useStudentBalanceTransaction(id: string) {
  return useSuspenseQuery(useStudentBalanceTransactionQueryOptions(id))
}
