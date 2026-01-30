import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

export function useSetImpersonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ userId }: { userId: string }) => {
      const response = await tuyau.api.v1.admin.impersonation.$post({
        userId,
      })
      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao ativar personificação')
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidar todas as queries para refletir o novo contexto
      queryClient.invalidateQueries()
    },
  })
}

export function useClearImpersonation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async () => {
      const response = await tuyau.api.v1.admin.impersonation.$delete()
      if (response.error) {
        throw new Error(
          (response.error as any).value?.message || 'Erro ao desativar personificação'
        )
      }
      return response.data
    },
    onSuccess: () => {
      // Invalidar todas as queries para refletir o contexto original
      queryClient.invalidateQueries()
    },
  })
}
