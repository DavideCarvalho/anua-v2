import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { InferResponseType } from '@tuyau/client'

type SchoolShowRoute = ReturnType<typeof tuyau.$route<'api.v1.schools.show'>>

export type SchoolResponse = InferResponseType<SchoolShowRoute['$get']>

export function useSchoolQueryOptions(id: string) {
  return {
    queryKey: ['school', id],
    queryFn: () => {
      return tuyau.$route('api.v1.schools.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  }
}

export function useSchool(id: string) {
  return useSuspenseQuery(useSchoolQueryOptions(id))
}

// Get school by slug
type SchoolBySlugRoute = ReturnType<typeof tuyau.$route<'api.v1.schools.showBySlug'>>

export type SchoolBySlugResponse = InferResponseType<SchoolBySlugRoute['$get']>

export function useSchoolBySlugQueryOptions(slug: string) {
  return {
    queryKey: ['school', 'slug', slug],
    queryFn: () => {
      return tuyau.$route('api.v1.schools.showBySlug', { slug }).$get().unwrap()
    },
    enabled: !!slug,
  }
}

export function useSchoolBySlug(slug: string) {
  return useSuspenseQuery(useSchoolBySlugQueryOptions(slug))
}
