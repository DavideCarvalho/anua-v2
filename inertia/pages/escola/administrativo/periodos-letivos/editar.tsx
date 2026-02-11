import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { EscolaLayout } from '~/components/layouts'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { EditAcademicPeriodForm } from '~/containers/academic-periods/edit-academic-period-form'
import { useAcademicPeriodQueryOptions } from '~/hooks/queries/use_academic_period'
import { useAcademicPeriodCoursesQueryOptions } from '~/hooks/queries/use_academic_period_courses'

interface Props {
  academicPeriodId: string
}

export default function EditarPeriodoLetivoPage({ academicPeriodId }: Props) {
  const periodQuery = useQuery(useAcademicPeriodQueryOptions(academicPeriodId))
  const coursesQuery = useQuery(
    useAcademicPeriodCoursesQueryOptions(academicPeriodId, { isActive: true })
  )

  const isLoading = periodQuery.isLoading || coursesQuery.isLoading
  const error = periodQuery.error || coursesQuery.error
  const data =
    periodQuery.data && coursesQuery.data
      ? {
          ...periodQuery.data,
          courses: coursesQuery.data,
        }
      : undefined

  return (
    <EscolaLayout>
      <Head title="Editar Período Letivo" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.periodosLetivos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Período Letivo</h1>
            {data && <p className="text-muted-foreground">{data.name}</p>}
          </div>
        </div>

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
          <EditAcademicPeriodForm
            academicPeriod={{
              id: data.id,
              name: data.name,
              slug: data.slug,
              startDate: String(data.startDate),
              endDate: String(data.endDate),
              enrollmentStartDate: data.enrollmentStartDate
                ? String(data.enrollmentStartDate)
                : null,
              enrollmentEndDate: data.enrollmentEndDate ? String(data.enrollmentEndDate) : null,
              isActive: data.isActive,
              isClosed: data.isClosed,
              segment: data.segment,
              courses: data.courses,
            }}
          />
        )}
      </div>
    </EscolaLayout>
  )
}
