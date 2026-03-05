import { Head } from '@inertiajs/react'
import { useQuery } from '@tanstack/react-query'
import { RefreshCw } from 'lucide-react'
import { Route } from '@tuyau/core/types'

import { EscolaLayout } from '~/components/layouts'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { Skeleton } from '~/components/ui/skeleton'
import { api } from '~/lib/api'
import { PeriodoLetivoHeader } from '~/containers/academic-periods/periodo-letivo-header'
import { PeriodoLetivoInfoCard } from '~/containers/academic-periods/periodo-letivo-info-card'
import { CursosDoPeríodoList } from '~/containers/academic-periods/cursos-do-periodo-list'

interface Props {
  academicPeriodSlug: string
}

type AcademicPeriodResponse = Route.Response<'api.v1.academic_periods.show_dashboard_by_slug'>

type AcademicPeriodView = {
  id: string
  name: string
  startDate: string | Date | undefined
  endDate: string | Date | undefined
  enrollmentStartDate: string | Date | null | undefined
  enrollmentEndDate: string | Date | null | undefined
  isActive: boolean
  isClosed: boolean
  metrics?: {
    coursesCount: number
    levelsCount: number
    studentsCount: number
    classesCount: number
  }
  segment: 'KINDERGARTEN' | 'ELEMENTARY' | 'HIGHSCHOOL' | 'TECHNICAL' | 'UNIVERSITY' | 'OTHER'
  courseAcademicPeriods?: Array<{
    id: string
    courseId: string
    metrics?: {
      levelsCount: number
      activeLevelsCount: number
      inactiveLevelsCount: number
      studentsCount: number
      classesCount: number
    }
    course?: {
      name?: string | null
      slug?: string | null
      enrollmentMinimumAge?: number | null
      enrollmentMaximumAge?: number | null
      maxStudentsPerClass?: number | null
    } | null
    levelAssignments?: Array<{
      id: string
      levelId: string
      isActive: boolean
      studentsCount?: number
      classesCount?: number
      level?: {
        name?: string | null
        slug?: string | null
        order?: number | null
        contractId?: string | null
      } | null
    }> | null
  }> | null
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
  const { data, isLoading, error, refetch, isRefetching } = useQuery(
    api.api.v1.academicPeriods.showDashboardBySlug.queryOptions({
      params: { slug: academicPeriodSlug },
    })
  )

  const resolvedAcademicPeriod = (() => {
    const payload = data as AcademicPeriodResponse | { data?: AcademicPeriodResponse } | undefined

    if (!payload) return null

    if (typeof payload === 'object' && 'data' in payload && payload.data) {
      return payload.data as AcademicPeriodView
    }

    return payload as AcademicPeriodView
  })()

  const courses = (resolvedAcademicPeriod?.courseAcademicPeriods ?? []).map((item) => ({
    id: item.id,
    courseId: item.courseId,
    name: item.course?.name ?? 'Curso',
    slug: item.course?.slug ?? null,
    enrollmentMinimumAge: item.course?.enrollmentMinimumAge ?? null,
    enrollmentMaximumAge: item.course?.enrollmentMaximumAge ?? null,
    maxStudentsPerClass: item.course?.maxStudentsPerClass ?? null,
    metrics: item.metrics,
    levels: (item.levelAssignments ?? []).map((assignment) => ({
      id: assignment.id,
      levelId: assignment.levelId,
      name: assignment.level?.name ?? 'Nível',
      slug: assignment.level?.slug ?? null,
      order: assignment.level?.order ?? 0,
      contractId: assignment.level?.contractId ?? null,
      isActive: assignment.isActive,
      studentsCount: assignment.studentsCount ?? 0,
      classesCount: assignment.classesCount ?? 0,
    })),
  }))

  return (
    <EscolaLayout>
      <Head title={resolvedAcademicPeriod?.name ?? 'Detalhes do Período Letivo'} />

      {isLoading ? (
        <PeriodoLetivoDetalhesSkeleton />
      ) : Boolean(error) ? (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm text-destructive">
                Erro ao carregar período letivo. Tente novamente.
              </p>
              <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isRefetching}>
                <RefreshCw className={`mr-2 h-4 w-4 ${isRefetching ? 'animate-spin' : ''}`} />
                Tentar novamente
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : resolvedAcademicPeriod ? (
        <div className="space-y-6">
          <PeriodoLetivoHeader
            id={resolvedAcademicPeriod.id}
            name={resolvedAcademicPeriod.name ?? 'Período letivo'}
            startDate={String(resolvedAcademicPeriod.startDate ?? '')}
            endDate={String(resolvedAcademicPeriod.endDate ?? '')}
            isActive={Boolean(resolvedAcademicPeriod.isActive)}
            isClosed={Boolean(resolvedAcademicPeriod.isClosed)}
          />

          <PeriodoLetivoInfoCard
            startDate={String(resolvedAcademicPeriod.startDate ?? '')}
            endDate={String(resolvedAcademicPeriod.endDate ?? '')}
            enrollmentStartDate={
              resolvedAcademicPeriod.enrollmentStartDate
                ? String(resolvedAcademicPeriod.enrollmentStartDate)
                : null
            }
            enrollmentEndDate={
              resolvedAcademicPeriod.enrollmentEndDate
                ? String(resolvedAcademicPeriod.enrollmentEndDate)
                : null
            }
            segment={resolvedAcademicPeriod.segment}
          />

          {resolvedAcademicPeriod.metrics && (
            <Card>
              <CardContent className="pt-6">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Cursos</p>
                    <p className="text-2xl font-semibold">
                      {resolvedAcademicPeriod.metrics.coursesCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Series/Niveis</p>
                    <p className="text-2xl font-semibold">
                      {resolvedAcademicPeriod.metrics.levelsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Alunos</p>
                    <p className="text-2xl font-semibold">
                      {resolvedAcademicPeriod.metrics.studentsCount}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Turmas</p>
                    <p className="text-2xl font-semibold">
                      {resolvedAcademicPeriod.metrics.classesCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <CursosDoPeríodoList courses={courses} segment={resolvedAcademicPeriod.segment} />
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
