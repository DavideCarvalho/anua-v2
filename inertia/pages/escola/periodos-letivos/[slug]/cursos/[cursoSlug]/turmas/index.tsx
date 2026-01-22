import { EscolaLayout } from '../../../../../../../components/layouts/escola-layout'
import { ClassesGrid } from '../../../../../../../containers/course-dashboard'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  courseId: string
  academicPeriodId: string
  courseName: string
  academicPeriodName: string
}

export default function CursoTurmasPage({
  academicPeriodSlug,
  courseSlug,
  courseId,
  academicPeriodId,
  courseName,
  academicPeriodName,
}: Props) {
  return (
    <EscolaLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Turmas do Curso</h1>
          <p className="text-muted-foreground">
            {courseName} - {academicPeriodName}
          </p>
        </div>

        <ClassesGrid
          courseId={courseId}
          academicPeriodId={academicPeriodId}
          academicPeriodSlug={academicPeriodSlug}
          courseSlug={courseSlug}
        />
      </div>
    </EscolaLayout>
  )
}
