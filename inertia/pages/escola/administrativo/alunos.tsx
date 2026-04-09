import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'

import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { SimplifiedPageShell } from '../../../components/escola/simplified-page-shell'
import { SimplifiedBasicList } from '../../../components/escola/simplified-basic-list'
import { Button } from '../../../components/ui/button'
import { EscolaLayout } from '../../../components/layouts'
import { StudentsListContainer } from '../../../containers/students-list-container'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'

export default function AlunosPage() {
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
      <EscolaLayoutSimplificado title="Alunos" viewMode={viewMode} onViewModeChange={onViewModeChange}>
        <Head title="Alunos" />

        <SimplifiedPageShell
          title="Alunos"
          description="Acesse rapidamente os alunos matriculados e as principais ações." 
          actions={
            <>
              <Link href="/escola/administrativo/matriculas/nova">
                <Button size="sm">Nova matrícula</Button>
              </Link>
              <Link href="/escola/administrativo/alunos">
                <Button size="sm" variant="outline">
                  Atualizar lista
                </Button>
              </Link>
            </>
          }
        >
          <SimplifiedBasicList>
            <StudentsListContainer />
          </SimplifiedBasicList>
        </SimplifiedPageShell>
      </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
      <Head title="Alunos" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Alunos</h1>
          <p className="text-muted-foreground">Gerencie os alunos matriculados na escola</p>
        </div>

        <StudentsListContainer />
      </div>
    </EscolaLayout>
  )
}
