import { tuyau } from '../../lib/api'
import type { QueryOptions } from '@tanstack/react-query'
import type { InferResponseType } from '@tuyau/client'

const $route = tuyau.api.v1['academic-periods']['by-slug'][':slug'].$get

export type AcademicPeriodBySlugResponse = InferResponseType<typeof $route>

interface UseAcademicPeriodBySlugOptions {
  slug: string
  include?: string
}

export function useAcademicPeriodBySlugQueryOptions({
  slug,
  include,
}: UseAcademicPeriodBySlugOptions) {
  return {
    queryKey: ['academic-period', 'by-slug', slug, { include }],
    queryFn: () => {
      return $route({ slug }, { query: { include } }).unwrap()
    },
    enabled: !!slug,
  } satisfies QueryOptions<AcademicPeriodBySlugResponse>
}
