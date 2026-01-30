import { tuyau } from '../../lib/api'

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
      return tuyau.api.v1['academic-periods']
        ['by-slug']({ slug })
        .$get({ query: { include } })
        .unwrap()
    },
    enabled: !!slug,
  }
}
