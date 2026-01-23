import { Head, usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'
import { ArrowLeft } from 'lucide-react'

import type { SharedProps } from '~/lib/types'
import { EscolaLayout } from '~/components/layouts'
import { NewAcademicPeriodForm } from '~/containers/academic-periods/new-academic-period-form'
import { Button } from '~/components/ui/button'

export default function NovoPeriodoLetivoPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Novo período letivo" />

      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link route="web.escola.periodosLetivos">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Novo Período Letivo</h1>
            <p className="text-muted-foreground">
              Configure um novo período letivo para a escola
            </p>
          </div>
        </div>

        {schoolId ? (
          <NewAcademicPeriodForm schoolId={schoolId} />
        ) : (
          <div className="text-sm text-muted-foreground">
            Escola não encontrada no contexto.
          </div>
        )}
      </div>
    </EscolaLayout>
  )
}
