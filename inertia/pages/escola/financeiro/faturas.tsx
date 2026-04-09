import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'

import { SimplifiedBasicList } from '../../../components/escola/simplified-basic-list'
import { SimplifiedPageShell } from '../../../components/escola/simplified-page-shell'
import { EscolaLayout } from '../../../components/layouts'
import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { Button } from '../../../components/ui/button'
import { InvoicesContainer } from '../../../containers/invoices-container'
import { InvoicesSimplifiedTable } from '../../../containers/invoices-simplified-table'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'

export default function FaturasPage() {
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
      <EscolaLayoutSimplificado title="Faturas" viewMode={viewMode} onViewModeChange={onViewModeChange}>
        <Head title="Faturas" />

        <SimplifiedPageShell
          title="Faturas"
          description="Acompanhe cobranças com foco nas tarefas financeiras essenciais."
          actions={
            <>
              <Link href="/escola/financeiro/faturas">
                <Button size="sm">Atualizar faturas</Button>
              </Link>
              <Link href="/escola/financeiro/inadimplencia">
                <Button size="sm" variant="outline">
                  Ver inadimplência
                </Button>
              </Link>
            </>
          }
          >
            <SimplifiedBasicList>
              <InvoicesSimplifiedTable />
            </SimplifiedBasicList>
          </SimplifiedPageShell>
        </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
      <Head title="Faturas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Faturas</h1>
          <p className="text-muted-foreground">Gerencie as faturas dos alunos da escola</p>
        </div>

        <InvoicesContainer />
      </div>
    </EscolaLayout>
  )
}
