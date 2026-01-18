import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'
import { SchoolPartnersTableContainer } from '../../../containers/school-partners-table-container'
import { NewSchoolPartnerModal } from '../../../containers/school-partners/new-school-partner-modal'
import { EditSchoolPartnerModal } from '../../../containers/school-partners/edit-school-partner-modal'

export default function ParceirosPage() {
  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  return (
    <EscolaLayout>
      <Head title="Parceiros" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Parceiros</h1>
          <Button onClick={() => setIsNewModalOpen(true)}>Novo Parceiro</Button>
        </div>

        <SchoolPartnersTableContainer onEdit={(id) => setEditingId(id)} />

        <NewSchoolPartnerModal
          open={isNewModalOpen}
          onCancel={() => setIsNewModalOpen(false)}
          onSubmit={() => setIsNewModalOpen(false)}
        />

        {editingId && (
          <EditSchoolPartnerModal
            partnerId={editingId}
            open={true}
            onCancel={() => setEditingId(null)}
          />
        )}
      </div>
    </EscolaLayout>
  )
}
