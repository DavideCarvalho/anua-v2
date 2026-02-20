import { useMutation, useQueryClient } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferRequestType } from '@tuyau/client'

const resolveCreateRoute = () => tuyau.$route('api.v1.schoolChains.createSchoolChain')
type CreateSchoolChainPayload = InferRequestType<ReturnType<typeof resolveCreateRoute>['$post']>

export function useCreateSchoolChain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSchoolChainPayload) => {
      return tuyau.$route('api.v1.schoolChains.createSchoolChain').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-chains'] })
    },
  })
}

export function useDeleteSchoolChain() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.schoolChains.deleteSchoolChain', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-chains'] })
    },
  })
}

const resolveCreateGroupRoute = () => tuyau.$route('api.v1.schoolGroups.createSchoolGroup')
type CreateSchoolGroupPayload = InferRequestType<
  ReturnType<typeof resolveCreateGroupRoute>['$post']
>

export function useCreateSchoolGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateSchoolGroupPayload) => {
      return tuyau.$route('api.v1.schoolGroups.createSchoolGroup').$post(data).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-groups'] })
    },
  })
}

export function useDeleteSchoolGroup() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => {
      return tuyau.$route('api.v1.schoolGroups.deleteSchoolGroup', { id }).$delete({}).unwrap()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['school-groups'] })
    },
  })
}
