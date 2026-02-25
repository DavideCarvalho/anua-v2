import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'

type CreateCanteenItemPayload = {
  canteenId: string
  name: string
  description?: string
  price: number
  category?: string
  isActive?: boolean
  image?: File | null
}

type UpdateCanteenItemPayload = {
  id: string
  name?: string
  description?: string
  price?: number
  category?: string
  isActive?: boolean
  removeImage?: boolean
  image?: File | null
}

async function parseResponse(response: Response) {
  if (response.ok) {
    return response.json()
  }

  try {
    const error = await response.json()
    throw new Error(error.message || 'Erro na operação')
  } catch {
    throw new Error('Erro na operação')
  }
}

function appendIfDefined(
  formData: FormData,
  key: string,
  value: string | number | boolean | undefined
) {
  if (value === undefined) {
    return
  }

  formData.append(key, String(value))
}

export function useCreateCanteenItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: CreateCanteenItemPayload) => {
      const formData = new FormData()
      appendIfDefined(formData, 'canteenId', data.canteenId)
      appendIfDefined(formData, 'name', data.name)
      appendIfDefined(formData, 'description', data.description)
      appendIfDefined(formData, 'price', data.price)
      appendIfDefined(formData, 'category', data.category)
      appendIfDefined(formData, 'isActive', data.isActive)

      if (data.image) {
        formData.append('image', data.image)
      }

      const response = await fetch('/api/v1/canteen-items', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      })

      return parseResponse(response)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}

export function useUpdateCanteenItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, ...data }: UpdateCanteenItemPayload) => {
      const formData = new FormData()
      appendIfDefined(formData, 'name', data.name)
      appendIfDefined(formData, 'description', data.description)
      appendIfDefined(formData, 'price', data.price)
      appendIfDefined(formData, 'category', data.category)
      appendIfDefined(formData, 'isActive', data.isActive)
      appendIfDefined(formData, 'removeImage', data.removeImage)

      if (data.image) {
        formData.append('image', data.image)
      }

      const response = await fetch(`/api/v1/canteen-items/${id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include',
      })

      return parseResponse(response)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['canteen-item', variables.id] })
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}

export function useDeleteCanteenItem() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteenItems.destroy', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}

export function useToggleCanteenItemActive() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.canteenItems.toggleActive', { id }).$patch({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canteen-items'] })
    },
  })
}
