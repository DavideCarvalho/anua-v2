import { EscolaLayout } from '../../../../../../../../components/layouts/escola-layout'
import { TurmaLayout } from '../../../../../../../../components/layouts/turma-layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '~/components/ui/card'
import { GradesAccordion } from '../../../../../../../../containers/turma'

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

export default function TurmaNotasPage({
  academicPeriodSlug,
  courseSlug,
  classSlug,
  classId,
  academicPeriodId,
  courseId,
  className,
  courseName,
}: Props) {
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
            <CardTitle>Notas por Matéria</CardTitle>
            <CardDescription>
              Visualize as notas dos alunos agrupadas por matéria
            </CardDescription>
          </CardHeader>
          <CardContent>
            <GradesAccordion classId={classId} courseId={courseId} academicPeriodId={academicPeriodId} />
          </CardContent>
        </Card>
      </TurmaLayout>
    </EscolaLayout>
  )
}
