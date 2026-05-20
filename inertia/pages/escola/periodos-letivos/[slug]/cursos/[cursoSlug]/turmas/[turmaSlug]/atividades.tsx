import { useState } from 'react'
import { Plus } from 'lucide-react'

import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { AssignmentsTable, NewAssignmentModal } from '../../../../../../../../containers/turma'
import { SubPeriodFilter } from '../../../../../../../../containers/academic-periods/components/sub-period-filter'
import { useAuthUser } from '~/stores/auth_store'

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

export default function TurmaAtividadesPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  academicPeriodId,
  courseId,
  className,
  courseName,
}: Props) {
  const user = useAuthUser()
  const [modalOpen, setModalOpen] = useState(false)
  const [subPeriodId, setSubPeriodId] = useState('')

  return (
    <TurmaLayout
      turmaName={className}
      courseName={courseName}
      academicPeriodSlug={academicPeriodSlug}
      courseSlug={courseSlug}
      classSlug={classSlug}
      screenId="escola_turma_atividades"
      classId={classId}
      courseId={courseId}
      academicPeriodId={academicPeriodId}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Atividades e Trabalhos</CardTitle>
              <CardDescription>Gerencie as atividades e trabalhos dos alunos</CardDescription>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar atividade
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SubPeriodFilter
            academicPeriodId={academicPeriodId}
            value={subPeriodId}
            onChange={setSubPeriodId}
          />
          <AssignmentsTable
            classId={classId}
            courseId={courseId}
            academicPeriodId={academicPeriodId}
            subPeriodId={subPeriodId}
          />
        </CardContent>
      </Card>

      <NewAssignmentModal
        classId={classId}
        academicPeriodId={academicPeriodId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={user}
      />
    </TurmaLayout>
  )
}
