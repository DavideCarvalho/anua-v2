import { Head } from '@inertiajs/react'

import { EscolaLayout } from '../../../components/layouts'
import { PedagogicalCalendar } from '../../../containers/pedagogico/pedagogical-calendar'

export default function PedagogicoCalendarioPage() {
  return (
    <EscolaLayout>
      <Head title="Calendário" />

      <div className="space-y-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Calendário Pedagógico</h1>
          <p className="text-sm text-muted-foreground">
            Visualize e organize atividades, provas, eventos e dias especiais da turma.
          </p>
        </div>

        <PedagogicalCalendar />
      </div>
    </EscolaLayout>
  )
}
