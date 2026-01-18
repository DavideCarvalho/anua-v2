import { Head, usePage } from '@inertiajs/react'
import { useState } from 'react'

import type { SharedProps } from '../../../lib/types'
import { EscolaLayout } from '../../../components/layouts'
import { Button } from '../../../components/ui/button'

import { SubjectsTableContainer } from '../../../containers/subjects/subjects-table-container'
import { NewSubjectModal } from '../../../containers/subjects/new-subject-modal'
import { EditSubjectModal } from '../../../containers/subjects/edit-subject-modal'

export default function MateriasPage() {
  const { props } = usePage<SharedProps>()
  const schoolId = props.user?.schoolId

  const [isNewModalOpen, setIsNewModalOpen] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  if (!schoolId) {
    return (
      <EscolaLayout>
        <Head title="Matérias" />
        <div className="text-sm text-muted-foreground">Escola não encontrada no contexto.</div>
      </EscolaLayout>
    )
  }

  return (
    <EscolaLayout>
      <Head title="Matérias" />

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Matérias</h1>
          <Button onClick={() => setIsNewModalOpen(true)}>Adicionar Matéria</Button>
        </div>

        <SubjectsTableContainer schoolId={schoolId} onEdit={(id) => setEditingId(id)} />

        <NewSubjectModal
          open={isNewModalOpen}
          onCancel={() => setIsNewModalOpen(false)}
          onSubmit={() => setIsNewModalOpen(false)}
          schoolId={schoolId}
        />

        {editingId && (
          <EditSubjectModal subjectId={editingId} open={true} onCancel={() => setEditingId(null)} />
        )}
      </div>
    </EscolaLayout>
  )
}
