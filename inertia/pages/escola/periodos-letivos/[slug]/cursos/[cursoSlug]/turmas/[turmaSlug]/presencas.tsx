import { useState } from 'react'
import { Plus } from 'lucide-react'

import { EscolaLayout } from '../../../../../../../../components/layouts/escola-layout'
import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { AttendancesTable, NewAttendanceModal } from '../../../../../../../../containers/turma'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
  classId: string
  academicPeriodId: string
  courseId: string
  className: string
  courseName: string
  academicPeriodName: string
}

export default function TurmaPresencasPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  academicPeriodId,
  courseId,
  className,
  courseName,
}: Props) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <EscolaLayout>
      <TurmaLayout
        turmaName={className}
        courseName={courseName}
        academicPeriodSlug={academicPeriodSlug}
        courseSlug={courseSlug}
        classSlug={classSlug}
      >
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Lista de Presenças</CardTitle>
                <CardDescription>Gerencie a frequência dos alunos nas aulas</CardDescription>
              </div>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Registrar presença
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AttendancesTable classId={classId} academicPeriodId={academicPeriodId} courseId={courseId} />
          </CardContent>
        </Card>

        <NewAttendanceModal
          classId={classId}
          academicPeriodId={academicPeriodId}
          courseId={courseId}
          open={modalOpen}
          onOpenChange={setModalOpen}
        />
      </TurmaLayout>
    </EscolaLayout>
  )
}
