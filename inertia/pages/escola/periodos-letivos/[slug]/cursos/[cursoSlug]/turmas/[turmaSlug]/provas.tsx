import { useState } from 'react'
import type { FC } from 'react'
import { Plus } from 'lucide-react'

import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { ExamsList } from '../../../../../../../../containers/academico/exams-list'
import { NewExamModal } from '../../../../../../../../containers/turma'
import { SubPeriodFilter } from '../../../../../../../../containers/academic-periods/components/sub-period-filter'
import { useAuthUser } from '~/stores/auth_store'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
  classId: string
  courseId: string
  className: string
  courseName: string
  academicPeriodId: string
}

const TurmaProvasPage: FC<Props> = ({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  courseId,
  className,
  courseName,
  academicPeriodId,
}) => {
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
      screenId="escola_turma_provas"
      classId={classId}
      courseId={courseId}
      academicPeriodId={academicPeriodId}
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Provas e Avaliações</CardTitle>
              <CardDescription>Gerencie as provas e avaliacoes dos alunos</CardDescription>
            </div>
            <Button onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar prova
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <SubPeriodFilter
            academicPeriodId={academicPeriodId}
            value={subPeriodId}
            onChange={setSubPeriodId}
          />
          <ExamsList
            classId={classId}
            courseId={courseId}
            academicPeriodId={academicPeriodId}
            subPeriodId={subPeriodId}
          />
        </CardContent>
      </Card>

      <NewExamModal
        classId={classId}
        academicPeriodId={academicPeriodId}
        open={modalOpen}
        onOpenChange={setModalOpen}
        user={user}
      />
    </TurmaLayout>
  )
}

export default TurmaProvasPage
