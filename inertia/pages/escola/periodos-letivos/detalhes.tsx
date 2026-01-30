import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { Loader2 } from 'lucide-react'

import { EscolaLayout } from '~/components/layouts'
import { Card, CardContent } from '~/components/ui/card'
import { useAcademicPeriodBySlugQueryOptions } from '~/hooks/queries/use_academic_period_by_slug'
import { PeriodoLetivoHeader } from '~/containers/academic-periods/periodo-letivo-header'
import { PeriodoLetivoInfoCard } from '~/containers/academic-periods/periodo-letivo-info-card'
import { CursosDoPeríodoList } from '~/containers/academic-periods/cursos-do-periodo-list'

interface Props {
  academicPeriodSlug: string
}

export default function PeriodoLetivoDetalhesPage({ academicPeriodSlug }: Props) {
  const { data, isLoading, error } = useQuery(
    useAcademicPeriodBySlugQueryOptions({
      slug: academicPeriodSlug,
      include: 'courses',
    })
  )

  return (
    <EscolaLayout>
      <Head title={data?.name ?? 'Detalhes do Período Letivo'} />

      <div className="space-y-6">
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && (
          <Card className="border-destructive">
            <CardContent className="pt-6">
              <p className="text-sm text-destructive">
                Erro ao carregar período letivo. Tente novamente.
              </p>
            </CardContent>
          </Card>
        )}

        {data && (
          <>
            <PeriodoLetivoHeader
              id={data.id}
              name={data.name}
              startDate={String(data.startDate)}
              endDate={String(data.endDate)}
              isActive={data.isActive}
              isClosed={data.isClosed}
            />

            <PeriodoLetivoInfoCard
              startDate={String(data.startDate)}
              endDate={String(data.endDate)}
              enrollmentStartDate={data.enrollmentStartDate ? String(data.enrollmentStartDate) : null}
              enrollmentEndDate={data.enrollmentEndDate ? String(data.enrollmentEndDate) : null}
              segment={data.segment}
            />

            <CursosDoPeríodoList courses={(data as any).courses ?? []} segment={data.segment} />
          </>
        )}
      </div>
    </EscolaLayout>
  )
}
