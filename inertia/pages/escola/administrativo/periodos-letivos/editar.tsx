import { Head } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Loader2 } from 'lucide-react'

import { EscolaLayout } from '~/components/layouts'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { tuyau } from '~/lib/api'
import { EditAcademicPeriodForm } from '~/containers/academic-periods/edit-academic-period-form'

interface Props {
  academicPeriodId: string
}

export default function EditarPeriodoLetivoPage({ academicPeriodId }: Props) {
  const { data, isLoading, error } = useQuery({
    queryKey: ['academic-period', academicPeriodId, 'with-courses'],
    queryFn: async () => {
      // Fetch period data
      const period = await tuyau.api.v1['academic-periods'][':id'].$get({
        id: academicPeriodId,
      }).unwrap()

      // Fetch courses
      const courses = await tuyau.api.v1['academic-periods'][':id'].courses.$get({
        id: academicPeriodId,
      }).unwrap()

      return {
        ...period,
        courses,
      }
    },
  })

  return (
    <EscolaLayout>
      <Head title="Editar Período Letivo" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.administrativo.periodosLetivos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Editar Período Letivo</h1>
            {data && (
              <p className="text-muted-foreground">{data.name}</p>
            )}
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
              startDate: data.startDate,
              endDate: data.endDate,
              enrollmentStartDate: data.enrollmentStartDate,
              enrollmentEndDate: data.enrollmentEndDate,
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
