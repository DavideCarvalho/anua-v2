import { Head, Link, usePage } from '@inertiajs/react'

import type { SharedProps } from '../../../../lib/types'
import { EscolaLayout } from '../../../../components/layouts'
import { NewAcademicPeriodForm } from '../../../../containers/academic-periods/new-academic-period-form'
import { Button } from '../../../../components/ui/button'

export default function NovoPeriodoLetivoPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  return (
    <EscolaLayout>
      <Head title="Novo período letivo" />

      <div className="container mx-auto py-8">
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Novo período letivo</h2>
          <Button variant="outline" asChild>
            <Link href="/escola/administrativo/periodos-letivos">Voltar</Link>
          </Button>
        </div>

        {schoolId ? (
          <NewAcademicPeriodForm schoolId={schoolId} onSuccess={() => {}} />
        ) : (
          <div className="text-sm text-muted-foreground">Escola não encontrada no contexto.</div>
        )}
      </div>
    </EscolaLayout>
  )
}
