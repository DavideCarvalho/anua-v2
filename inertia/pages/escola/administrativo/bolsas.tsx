import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { ScholarshipsTableContainer } from '../../../containers/scholarships-table-container'
import { NewScholarshipModal } from '../../../containers/scholarships/new-scholarship-modal'
import { EditScholarshipModal } from '../../../containers/scholarships/edit-scholarship-modal'

export default function BolsasPage() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <EscolaLayout>
      <Head title="Bolsas" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Bolsas</h1>
          <Button onClick={() => setIsNewModalOpen(true)}>Nova Bolsa</Button>
        </div>

        <ScholarshipsTableContainer onEdit={(id) => setEditingId(id)} />

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
