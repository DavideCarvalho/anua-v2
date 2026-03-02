import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'

import { EscolaLayout } from '~/components/layouts'
import { Card, CardContent } from '~/components/ui/card'
import { Skeleton } from '~/components/ui/skeleton'
import { api } from '~/lib/api'
import { PeriodoLetivoHeader } from '~/containers/academic-periods/periodo-letivo-header'
import { PeriodoLetivoInfoCard } from '~/containers/academic-periods/periodo-letivo-info-card'
import { CursosDoPeríodoList } from '~/containers/academic-periods/cursos-do-periodo-list'

interface Props {
  academicPeriodSlug: string
}

function PeriodoLetivoDetalhesSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Skeleton className="h-8 w-56" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
              <Skeleton className="h-4 w-36" />
            </div>
          </div>
        </div>
        <Skeleton className="h-10 w-28" />
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="space-y-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-6 w-52" />
            <Skeleton className="h-4 w-72" />
          </div>
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default function PeriodoLetivoDetalhesPage({ academicPeriodSlug }: Props) {
  const {
    data: academicPeriod,
    isLoading,
    error,
  } = useQuery(
    api.api.v1.academicPeriods.showBySlug.queryOptions({
      params: { slug: academicPeriodSlug },
      query: { include: 'courses' },
    })
  )

  return (
    <EscolaLayout>
      <Head title={academicPeriod?.name ?? 'Detalhes do Período Letivo'} />

      {isLoading ? (
        <PeriodoLetivoDetalhesSkeleton />
      ) : Boolean(error) ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-sm text-destructive">
              Erro ao carregar período letivo. Tente novamente.
            </p>
          </CardContent>
        </Card>
      ) : academicPeriod ? (
        <div className="space-y-6">
          <PeriodoLetivoHeader
            id={academicPeriod.id}
            name={academicPeriod.name ?? 'Período letivo'}
            startDate={String(academicPeriod.startDate ?? '')}
            endDate={String(academicPeriod.endDate ?? '')}
            isActive={Boolean(academicPeriod.isActive)}
            isClosed={Boolean(academicPeriod.isClosed)}
          />

          <PeriodoLetivoInfoCard
            startDate={String(academicPeriod.startDate ?? '')}
            endDate={String(academicPeriod.endDate ?? '')}
            enrollmentStartDate={
              academicPeriod.enrollmentStartDate ? String(academicPeriod.enrollmentStartDate) : null
            }
            enrollmentEndDate={
              academicPeriod.enrollmentEndDate ? String(academicPeriod.enrollmentEndDate) : null
            }
            segment={academicPeriod.segment as any}
          />

          <CursosDoPeríodoList
            courses={(academicPeriod.courses ?? []) as any[]}
            segment={academicPeriod.segment as any}
          />
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm text-muted-foreground">Período letivo não encontrado.</p>
          </CardContent>
        </Card>
      )}
    </EscolaLayout>
  )
}
