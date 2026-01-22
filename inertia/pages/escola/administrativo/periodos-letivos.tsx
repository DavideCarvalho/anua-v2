import { Head, usePage } from '@inertiajs/react'
import { Link } from '@tuyau/inertia/react'

import type { SharedProps } from '../../../lib/types'
import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { AcademicPeriodsTableContainer } from '../../../containers/academic-periods/academic-periods-table-container'

export default function PeriodosLetivosAdminPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Períodos letivos" />

      <div className="space-y-4">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold">Períodos letivos</h2>
          <Button asChild>
            <Link route="web.escola.administrativo.novoPeriodoLetivo">
              Criar período letivo
            </Link>
          </Button>
        </div>

        {schoolId ? (
          <AcademicPeriodsTableContainer schoolId={schoolId} />
        ) : (
          <div className="text-sm text-muted-foreground">Escola não encontrada no contexto.</div>
        )}
      </div>
    </EscolaLayout>
  )
}
