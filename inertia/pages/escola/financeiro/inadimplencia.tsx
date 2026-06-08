import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'

import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { SimplifiedPageShell } from '../../../components/escola/simplified-page-shell'
import { SimplifiedBasicList } from '../../../components/escola/simplified-basic-list'
import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../../components/ui/tabs'
import { StudentPaymentsContainer } from '../../../containers/student-payments-container'
import { AgreementProposalsContainer } from '../../../containers/agreement-proposals-container'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'

export default function InadimplenciaPage() {
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

  const paymentsContainer = <StudentPaymentsContainer status="OVERDUE" showSearch={false} />

  if (viewMode === 'simple') {
    return (
      <EscolaLayoutSimplificado
        title="Inadimplência"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      >
        <Head title="Inadimplência" />

        <SimplifiedPageShell
          title="Inadimplência"
          description="Acompanhe alunos com pagamentos em atraso e tome ações rápidas."
          actions={
            <Link route="web.escola.financeiro.faturas">
              <Button size="sm" variant="outline">
                Ver faturas
              </Button>
            </Link>
          }
        >
          <SimplifiedBasicList>{paymentsContainer}</SimplifiedBasicList>
        </SimplifiedPageShell>
      </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
      <Head title="Inadimplência" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Inadimplência</h1>
          <p className="text-muted-foreground">Acompanhe alunos e pagamentos em atraso</p>
        </div>

        <Tabs defaultValue="payments">
          <TabsList>
            <TabsTrigger value="payments">Pagamentos em atraso</TabsTrigger>
            <TabsTrigger value="proposals">Propostas de acordo</TabsTrigger>
          </TabsList>
          <TabsContent value="payments" className="mt-4">
            {paymentsContainer}
          </TabsContent>
          <TabsContent value="proposals" className="mt-4">
            <AgreementProposalsContainer />
          </TabsContent>
        </Tabs>
      </div>
    </EscolaLayout>
  )
}
