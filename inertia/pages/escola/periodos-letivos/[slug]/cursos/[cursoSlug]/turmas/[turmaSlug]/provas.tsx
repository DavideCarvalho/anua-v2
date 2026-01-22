import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Plus } from 'lucide-react'

import { EscolaLayout } from '../../../../../../../../components/layouts/escola-layout'
import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { ExamsList } from '../../../../../../../../containers/academico/exams-list'
import { NewExamModal } from '../../../../../../../../containers/turma'
import type { SharedProps } from '~/lib/types'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  classSlug: string
  classId: string
  className: string
  courseName: string
  academicPeriodId: string
}

export default function TurmaProvasPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  className,
  courseName,
  academicPeriodId,
}: Props) {
  const { props } = usePage<SharedProps>()
  const user = props.user
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
