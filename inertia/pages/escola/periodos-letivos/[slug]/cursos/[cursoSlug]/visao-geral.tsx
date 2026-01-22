import { EscolaLayout } from '../../../../../../components/layouts/escola-layout'
import {
  CourseMetrics,
  CourseAlerts,
  CourseActivityFeed,
} from '../../../../../../containers/course-dashboard'

interface Props {
  academicPeriodSlug: string
  courseSlug: string
  courseId: string
  academicPeriodId: string
  courseName: string
  academicPeriodName: string
}

export default function CursoVisaoGeralPage({
  courseId,
  academicPeriodId,
  courseName,
  academicPeriodName,
}: Props) {
  return (
    <EscolaLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Visão Geral do Curso</h1>
          <p className="text-muted-foreground">
            {courseName} - {academicPeriodName}
          </p>
        </div>

        {/* Metrics Cards */}
        <CourseMetrics courseId={courseId} academicPeriodId={academicPeriodId} />

        {/* Alerts and Activity Feed Grid */}
        <div className="grid gap-6 md:grid-cols-2">
          <CourseAlerts courseId={courseId} academicPeriodId={academicPeriodId} />
          <CourseActivityFeed courseId={courseId} academicPeriodId={academicPeriodId} />
        </div>
      </div>
    </EscolaLayout>
  )
}
