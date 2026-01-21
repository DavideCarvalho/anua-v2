import { useSuspenseQuery } from '@tanstack/react-query'
import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.$route('api.v1.schools.show')

export type SchoolResponse = InferResponseType<typeof $route.$get>

export function useSchoolQueryOptions(id: string) {
  return {
    queryKey: ['school', id],
    queryFn: () => {
      return tuyau.$route('api.v1.schools.show', { id }).$get().unwrap()
    },
    enabled: !!id,
  } satisfies QueryOptions<SchoolResponse>
}

export function useSchool(id: string) {
  return useSuspenseQuery(useSchoolQueryOptions(id))
}

// Get school by slug
const $slugRoute = tuyau.$route('api.v1.schools.showBySlug')

export type SchoolBySlugResponse = InferResponseType<typeof $slugRoute.$get>

export function useSchoolBySlugQueryOptions(slug: string) {
  return {
    queryKey: ['school', 'slug', slug],
    queryFn: () => {
      return tuyau.$route('api.v1.schools.showBySlug', { slug }).$get().unwrap()
    },
    enabled: !!slug,
  } satisfies QueryOptions<SchoolBySlugResponse>
}

export function useSchoolBySlug(slug: string) {
  return useSuspenseQuery(useSchoolBySlugQueryOptions(slug))
}
