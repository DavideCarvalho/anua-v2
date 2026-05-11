import { Link } from '@adonisjs/inertia/react'
import { Head } from '@inertiajs/react'
import { useEffect, useState } from 'react'

import { EscolaLayoutSimplificado } from '../../../components/layouts/escola-layout-simplificado'
import { SimplifiedPageShell } from '../../../components/escola/simplified-page-shell'
import { SimplifiedBasicList } from '../../../components/escola/simplified-basic-list'
import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { ScholarshipsTableContainer } from '../../../containers/scholarships-table-container'
import { NewScholarshipModal } from '../../../containers/scholarships/new-scholarship-modal'
import { EditScholarshipModal } from '../../../containers/scholarships/edit-scholarship-modal'
import {
  readEscolaDashboardViewMode,
  type EscolaDashboardViewMode,
  writeEscolaDashboardViewMode,
} from '../../../lib/escola-dashboard-view-mode'
import { useAuthUser } from '../../../stores/auth_store'

export default function BolsasPage() {
  const user = useAuthUser()
  const [viewMode, setViewMode] = useState<EscolaDashboardViewMode>('full')
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

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

  const tableContainer = (
    <ScholarshipsTableContainer
      onEdit={(id) => setEditingId(id)}
      onNew={() => setIsNewModalOpen(true)}
    />
  )

  if (viewMode === 'simple') {
    return (
      <EscolaLayoutSimplificado
        title="Bolsas"
        viewMode={viewMode}
        onViewModeChange={onViewModeChange}
      >
        <Head title="Bolsas" />

        <SimplifiedPageShell
          title="Bolsas"
          description="Gerencie os tipos de bolsa e descontos da escola."
          actions={
            <Button size="sm" onClick={() => setIsNewModalOpen(true)}>
              Nova bolsa
            </Button>
          }
        >
          <SimplifiedBasicList>{tableContainer}</SimplifiedBasicList>
        </SimplifiedPageShell>

        <NewScholarshipModal
          open={isNewModalOpen}
          onCancel={() => setIsNewModalOpen(false)}
          onSubmit={() => setIsNewModalOpen(false)}
        />

        {editingId && (
          <EditScholarshipModal
            scholarshipId={editingId}
            open={true}
            onCancel={() => setEditingId(null)}
          />
        )}
      </EscolaLayoutSimplificado>
    )
  }

  return (
    <EscolaLayout topbarActions={viewModeToggle}>
      <Head title="Bolsas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bolsas</h1>
          <p className="text-muted-foreground">Gerencie os tipos de bolsa da escola</p>
        </div>

        {tableContainer}

        <NewScholarshipModal
          open={isNewModalOpen}
          onCancel={() => setIsNewModalOpen(false)}
          onSubmit={() => setIsNewModalOpen(false)}
        />

        {editingId && (
          <EditScholarshipModal
            scholarshipId={editingId}
            open={true}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
    </EscolaLayout>
  )
}
