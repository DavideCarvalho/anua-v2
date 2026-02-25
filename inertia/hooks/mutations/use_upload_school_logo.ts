import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUploadSchoolLogo(schoolId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData()
      formData.append('logo', file)

      // tuyau request type is `unknown` for file uploads, so we use fetch
      // with the tuyau-generated URL for consistency
      const url = `/api/v1/schools/${schoolId}/logo`

      const response = await fetch(url, {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.message || 'Erro ao fazer upload')
      }

      const data = await response.json()
      return data.url as string
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school', schoolId] })
    },
  })
}
