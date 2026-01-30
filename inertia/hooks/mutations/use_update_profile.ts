import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import { router } from '@inertiajs/react'

interface UpdateProfileData {
  name: string
  phone?: string
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: UpdateProfileData) => {
      const response = await tuyau
        .$route('api.v1.responsavel.api.updateProfile')
        .$put({ body: data })

      if (response.error) {
        throw new Error((response.error as any).value?.message || 'Erro ao atualizar perfil')
      }

      return response.data
    },
    onSuccess: () => {
      // Invalidate any cached user data
      queryClient.invalidateQueries({ queryKey: ['user'] })
      // Reload the page to get fresh shared props
      router.reload({ only: ['user'] })
    },
  })
}
