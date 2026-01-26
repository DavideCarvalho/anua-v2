import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { EscolaLayout } from '../../../components/layouts'
import { ScholarshipsTableContainer } from '../../../containers/scholarships-table-container'
import { NewScholarshipModal } from '../../../containers/scholarships/new-scholarship-modal'
import { EditScholarshipModal } from '../../../containers/scholarships/edit-scholarship-modal'

export default function BolsasPage() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <EscolaLayout>
      <Head title="Bolsas" />

      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Bolsas</h1>
          <p className="text-muted-foreground">Gerencie os tipos de bolsa da escola</p>
        </div>

        <ScholarshipsTableContainer
          onEdit={(id) => setEditingId(id)}
          onNew={() => setIsNewModalOpen(true)}
        />

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
