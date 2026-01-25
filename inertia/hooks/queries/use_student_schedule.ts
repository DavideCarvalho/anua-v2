import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1.responsavel.students[':studentId'].schedule.$get

export type StudentScheduleResponse = InferResponseType<typeof $route>

export function useStudentScheduleQueryOptions(studentId: string) {
  return {
    queryKey: ['responsavel', 'students', studentId, 'schedule'],
    queryFn: async () => {
      const response = await $route({
        params: { studentId },
      })
      if (response.error) {
        throw new Error(response.error.message || 'Erro ao carregar horario')
      }
      return response.data
    },
  } satisfies QueryOptions
}
