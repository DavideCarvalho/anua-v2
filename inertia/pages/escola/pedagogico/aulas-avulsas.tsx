import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { EscolaLayout } from '~/components/layouts'
import { Button } from '~/components/ui/button'
import { Plus } from 'lucide-react'
import { ExtraClassesTable } from '~/containers/extra-classes/extra-classes-table'
import { CreateExtraClassModal } from '~/containers/extra-classes/create-extra-class-modal'
import { EditExtraClassModal } from '~/containers/extra-classes/edit-extra-class-modal'
import { EnrollStudentModal } from '~/containers/extra-classes/enroll-student-modal'
import { ExtraClassAttendanceModal } from '~/containers/extra-classes/extra-class-attendance-modal'
import { ExtraClassAttendanceSummary } from '~/containers/extra-classes/extra-class-attendance-summary'
import { ExtraClassStudentsTable } from '~/containers/extra-classes/extra-class-students-table'
import { useAcademicPeriodsQueryOptions } from '~/hooks/queries/use_academic_periods'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '~/components/ui/select'
import { Label } from '~/components/ui/label'

interface Props {
  schoolId: string
}

export default function AulasAvulsasPage({ schoolId }: Props) {
  const [createOpen, setCreateOpen] = useState(false)
  const [editId, setEditId] = useState<string | null>(null)
  const [enrollExtraClassId, setEnrollExtraClassId] = useState<string | null>(null)
  const [attendanceExtraClassId, setAttendanceExtraClassId] = useState<string | null>(null)
  const [summaryExtraClassId, setSummaryExtraClassId] = useState<string | null>(null)
  const [studentsExtraClassId, setStudentsExtraClassId] = useState<string | null>(null)
  const [selectedAcademicPeriodId, setSelectedAcademicPeriodId] = useState<string>('')

  const { data: periodsData } = useQuery(useAcademicPeriodsQueryOptions({ limit: 100 }))
  const academicPeriods = periodsData?.data ?? []

  return (
    <EscolaLayout>
      <Head title="Aulas Avulsas" />

      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Aulas Avulsas</h1>
            <p className="text-muted-foreground">Gerencie aulas extracurriculares da escola</p>
          </div>
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Nova Aula Avulsa
          </Button>
        </div>

        <div className="flex items-end gap-4">
          <div className="space-y-2">
            <Label>Período Letivo</Label>
            <Select value={selectedAcademicPeriodId} onValueChange={setSelectedAcademicPeriodId}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Todos os períodos" />
              </SelectTrigger>
              <SelectContent>
                {academicPeriods.map((ap) => (
                  <SelectItem key={ap.id} value={ap.id}>
                    {ap.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <ExtraClassesTable
          schoolId={schoolId}
          academicPeriodId={selectedAcademicPeriodId || undefined}
          onEdit={setEditId}
          onEnroll={setEnrollExtraClassId}
          onAttendance={setAttendanceExtraClassId}
          onSummary={setSummaryExtraClassId}
          onStudents={setStudentsExtraClassId}
        />

        <CreateExtraClassModal schoolId={schoolId} open={createOpen} onOpenChange={setCreateOpen} />

        {editId && (
          <EditExtraClassModal
            extraClassId={editId}
            open={!!editId}
            onOpenChange={(open) => !open && setEditId(null)}
          />
        )}

        {enrollExtraClassId && (
          <EnrollStudentModal
            extraClassId={enrollExtraClassId}
            open={!!enrollExtraClassId}
            onOpenChange={(open) => !open && setEnrollExtraClassId(null)}
          />
        )}

        {attendanceExtraClassId && (
          <ExtraClassAttendanceModal
            extraClassId={attendanceExtraClassId}
            open={!!attendanceExtraClassId}
            onOpenChange={(open) => !open && setAttendanceExtraClassId(null)}
          />
        )}

        {summaryExtraClassId && (
          <ExtraClassAttendanceSummary
            extraClassId={summaryExtraClassId}
            open={!!summaryExtraClassId}
            onOpenChange={(open) => !open && setSummaryExtraClassId(null)}
          />
        )}

        {studentsExtraClassId && (
          <ExtraClassStudentsTable
            extraClassId={studentsExtraClassId}
            open={!!studentsExtraClassId}
            onOpenChange={(open) => !open && setStudentsExtraClassId(null)}
          />
        )}
      </div>
    </EscolaLayout>
  )
}
