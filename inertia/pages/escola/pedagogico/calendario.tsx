import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'

import { SimplifiedBasicList } from '../../../components/escola/simplified-basic-list'
import { SimplifiedPageShell } from '../../../components/escola/simplified-page-shell'
import { EscolaLayout } from '../../../components/layouts'
import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { Button } from '../../../components/ui/button'
import { PedagogicalCalendar } from '../../../containers/pedagogico/pedagogical-calendar'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'

export default function PedagogicoCalendarioPage() {
  const user = useAuthUser()
  const [viewMode, setViewMode] = useState<EscolaDashboardViewMode>('full')

  useEffect(() => {
    setViewMode(readEscolaDashboardViewMode(user?.id))
  }, [user?.id])

  const onViewModeChange = (mode: EscolaDashboardViewMode) => {
    setViewMode(mode)
    writeEscolaDashboardViewMode(user?.id, mode)
  }

  const viewModeToggle = (
    <>
      <Button
        type="button"
        size="sm"
        variant={viewMode === 'full' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('full')}
      >
        Visão completa
      </Button>
      <Button
        type="button"
        size="sm"
        variant={viewMode === 'simple' ? 'default' : 'outline'}
        onClick={() => onViewModeChange('simple')}
      >
        Visão simplificada
      </Button>
    </>
  )

  if (viewMode === 'simple') {
    return (
      <EscolaLayoutSimplificado
        title="Calendário Pedagógico"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      >
        <Head title="Calendário" />

        <SimplifiedPageShell
          title="Calendário Pedagógico"
          description="Visualize compromissos e eventos sem distrações."
          actions={
            <>
              <Link href="/escola/pedagogico/calendario">
                <Button size="sm">Atualizar calendário</Button>
              </Link>
              <Link href="/escola/eventos/novo">
                <Button size="sm" variant="outline">
                  Novo evento
                </Button>
              </Link>
            </>
          }
        >
          <SimplifiedBasicList>
            <PedagogicalCalendar />
          </SimplifiedBasicList>
        </SimplifiedPageShell>
      </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
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
