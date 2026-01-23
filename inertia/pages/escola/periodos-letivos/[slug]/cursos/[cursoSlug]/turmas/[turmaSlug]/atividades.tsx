import { useState } from 'react'
import { usePage } from '@inertiajs/react'
import { Plus } from 'lucide-react'

import { EscolaLayout } from '../../../../../../../../components/layouts/escola-layout'
import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { AssignmentsTable, NewAssignmentModal } from '../../../../../../../../containers/turma'
import type { SharedProps } from '~/lib/types'

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
                <CardTitle>Atividades e Trabalhos</CardTitle>
                <CardDescription>Gerencie as atividades e trabalhos dos alunos</CardDescription>
              </div>
              <Button onClick={() => setModalOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar atividade
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <AssignmentsTable classId={classId} courseId={courseId} academicPeriodId={academicPeriodId} />
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
    </EscolaLayout>
  )
}
