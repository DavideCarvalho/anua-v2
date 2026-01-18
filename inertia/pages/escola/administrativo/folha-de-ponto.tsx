import { Head } from '@inertiajs/react'
import { useState } from 'react'

import { EscolaLayout } from '../../../components/layouts'
import { TeacherTimesheetTable } from '../../../containers/teachers-timesheet/teacher-timesheet-table'
import { ViewAbsencesModal } from '../../../containers/teachers-timesheet/view-absences-modal'

export default function FolhaDePontoPage() {
  const [absencesModal, setAbsencesModal] = useState<{
    open: boolean
    teacherId: string | null
    month: number
    year: number
  }>({
    open: false,
    teacherId: null,
    month: new Date().getMonth() + 1,
    year: new Date().getFullYear(),
  })

  return (
    <EscolaLayout>
      <Head title="Folha de Ponto" />

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Folha de Ponto</h2>

        <TeacherTimesheetTable
          onViewAbsences={(teacherId, month, year) => {
            setAbsencesModal({ open: true, teacherId, month, year })
          }}
        />

        <ViewAbsencesModal
          open={absencesModal.open}
          teacherId={absencesModal.teacherId}
          month={absencesModal.month}
          year={absencesModal.year}
          onOpenChange={(open) => {
            if (!open) {
              setAbsencesModal((prev) => ({ ...prev, open: false }))
            }
          }}
        />
      </div>
    </EscolaLayout>
  )
}
