import { useState } from 'react'
import type { FC } from 'react'
import { Plus } from 'lucide-react'

import { EscolaLayout } from '../../../../../../../../components/layouts/escola-layout'
import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { ExamsList } from '../../../../../../../../containers/academico/exams-list'
import { NewExamModal } from '../../../../../../../../containers/turma'
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
  courseId: _courseId,
  className,
  courseName,
  academicPeriodId,
}) => {
  const user = useAuthUser()
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
                <CardTitle>Provas e Avaliacoes</CardTitle>
                <CardDescription>Gerencie as provas e avaliacoes dos alunos</CardDescription>
              </div>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar prova
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <ExamsList classId={classId} />
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
    </EscolaLayout>
  )
}

export default TurmaProvasPage
