import { useQuery } from '@tanstack/react-query'
import { Users, GraduationCap, UserCheck, BarChart3 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface CourseMetricsProps {
  courseId: string
  academicPeriodId: string
}

interface MetricsData {
  summary: {
    totalStudents: number
    totalTeachers: number
    totalClasses: number
    averageAttendance: number
  }
}

async function fetchMetrics(courseId: string, academicPeriodId: string): Promise<MetricsData> {
  const response = await fetch(
    `/api/v1/courses/${courseId}/academic-periods/${academicPeriodId}/dashboard/metrics`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch metrics')
  }
  return response.json()
}

function CourseMetricsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[1, 2, 3, 4].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Carregando...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-8 w-20 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

function CourseMetricsError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5" />
          Métricas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive">Erro ao carregar métricas</p>
      </CardContent>
    </Card>
  )
}

export function CourseMetrics({ courseId, academicPeriodId }: CourseMetricsProps) {
  const {
    data: metrics,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['course-dashboard-metrics', courseId, academicPeriodId],
    queryFn: () => fetchMetrics(courseId, academicPeriodId),
  })

  if (isLoading) {
    return <CourseMetricsSkeleton />
  }

  if (isError || !metrics) {
    return <CourseMetricsError />
  }

  const metricCards = [
    {
      title: 'Total de Alunos',
      value: metrics.summary.totalStudents,
      icon: Users,
      iconColor: 'text-blue-600',
    },
    {
      title: 'Total de Turmas',
      value: metrics.summary.totalClasses,
      icon: GraduationCap,
      iconColor: 'text-purple-600',
    },
    {
      title: 'Total de Professores',
      value: metrics.summary.totalTeachers,
      icon: UserCheck,
      iconColor: 'text-green-600',
    },
    {
      title: 'Frequência Média',
      value: `${metrics.summary.averageAttendance.toFixed(1)}%`,
      icon: BarChart3,
      iconColor: 'text-orange-600',
    },
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {metricCards.map((metric) => {
        const Icon = metric.icon
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
              <Icon className={`h-4 w-4 ${metric.iconColor}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
