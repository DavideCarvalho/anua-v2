import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'

import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { SimplifiedPageShell } from '../../../components/escola/simplified-page-shell'
import { SimplifiedBasicList } from '../../../components/escola/simplified-basic-list'
import { Button } from '../../../components/ui/button'
import { EscolaLayout } from '../../../components/layouts'
import { ClassesListContainer } from '../../../containers/classes-list-container'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'

export default function TurmasPage() {
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
      <EscolaLayoutSimplificado title="Turmas" viewMode={viewMode} onViewModeChange={onViewModeChange}>
        <Head title="Turmas" />

        <SimplifiedPageShell
          title="Turmas"
          description="Gerencie as turmas com foco nas ações essenciais do dia a dia."
          actions={
            <>
              <Link href="/escola/pedagogico/turmas">
                <Button size="sm">Atualizar turmas</Button>
              </Link>
              <Link href="/escola/pedagogico/grade">
                <Button size="sm" variant="outline">
                  Ver grade
                </Button>
              </Link>
            </>
          }
        >
          <SimplifiedBasicList>
            <ClassesListContainer />
          </SimplifiedBasicList>
        </SimplifiedPageShell>
      </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
      <Head title="Turmas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turmas</h1>
          <p className="text-muted-foreground">Gerencie as turmas e suas configurações</p>
        </div>

        <ClassesListContainer />
      </div>
    </EscolaLayout>
  )
}
