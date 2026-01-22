import { useQuery } from '@tanstack/react-query'
import { Activity, FileText, UserCheck, Inbox } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { ptBR } from 'date-fns/locale'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'

interface CourseActivityFeedProps {
  courseId: string
  academicPeriodId: string
}

interface ActivityItem {
  id: string
  type: 'ASSIGNMENT' | 'ATTENDANCE'
  timestamp: string
  description: string
  className: string
  subjectName?: string
}

async function fetchActivityFeed(
  courseId: string,
  academicPeriodId: string
): Promise<ActivityItem[]> {
  const response = await fetch(
    `/api/v1/courses/${courseId}/academic-periods/${academicPeriodId}/dashboard/activity-feed?limit=10`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch activity feed')
  }
  return response.json()
}

function CourseActivityFeedSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center">
          <Activity className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando atividades...</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CourseActivityFeedError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-destructive">Erro ao carregar atividades</p>
      </CardContent>
    </Card>
  )
}

export function CourseActivityFeed({ courseId, academicPeriodId }: CourseActivityFeedProps) {
  const {
    data: activities,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['course-dashboard-activity-feed', courseId, academicPeriodId],
    queryFn: () => fetchActivityFeed(courseId, academicPeriodId),
  })

  if (isLoading) {
    return <CourseActivityFeedSkeleton />
  }

  if (isError || !activities) {
    return <CourseActivityFeedError />
  }

  if (activities.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Atividades Recentes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <Inbox className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">Nenhuma atividade recente</h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Não há atividades registradas no momento.
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Atividades Recentes
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => {
            const Icon = activity.type === 'ASSIGNMENT' ? FileText : UserCheck
            const iconColor = activity.type === 'ASSIGNMENT' ? 'text-blue-600' : 'text-green-600'

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className={`mt-1 rounded-full bg-muted p-2 ${iconColor}`}>
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm">{activity.description}</p>
                  <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                    <span>{activity.className}</span>
                    {activity.subjectName && (
                      <>
                        <span>•</span>
                        <span>{activity.subjectName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span>
                      {formatDistanceToNow(new Date(activity.timestamp), {
                        addSuffix: true,
                        locale: ptBR,
                      })}
                    </span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}
