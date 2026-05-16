import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { TrendingDown, FileText, Calendar, CheckCircle, Clock, Users } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

import { api } from '~/lib/api'
import { cn } from '~/lib/utils'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import {
  PedagogicalAlertSheet,
  type PedagogicalAlertKey,
  type PedagogicalAlerts,
} from './pedagogical-alert-sheet'

interface AlertCardConfig {
  key: PedagogicalAlertKey
  title: string
  icon: LucideIcon
  color: string
  bgClass: string
}

const alertConfigs: AlertCardConfig[] = [
  {
    key: 'studentsAtRiskByAttendance',
    title: 'Risco de Reprovação por Frequência',
    icon: Users,
    color: 'text-destructive',
    bgClass: 'bg-destructive/10 hover:bg-destructive/20 border-l-destructive',
  },
  {
    key: 'studentsAtRiskByGrade',
    title: 'Risco de Reprovação por Nota',
    icon: TrendingDown,
    color: 'text-destructive',
    bgClass: 'bg-destructive/10 hover:bg-destructive/20 border-l-destructive',
  },
  {
    key: 'examsWithoutGrades',
    title: 'Provas Sem Notas',
    icon: FileText,
    color: 'text-amber-500',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-l-amber-500',
  },
  {
    key: 'overdueActivities',
    title: 'Atividades Vencidas Sem Notas',
    icon: Calendar,
    color: 'text-amber-500',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-l-amber-500',
  },
  {
    key: 'ungradedSubmissions',
    title: 'Notas Pendentes',
    icon: CheckCircle,
    color: 'text-blue-500',
    bgClass: 'bg-blue-500/10 hover:bg-blue-500/20 border-l-blue-500',
  },
  {
    key: 'teachersMissingAttendance',
    title: 'Professores Sem Presença',
    icon: Clock,
    color: 'text-amber-500',
    bgClass: 'bg-amber-500/10 hover:bg-amber-500/20 border-l-amber-500',
  },
]

interface PedagogicalAlertsCardsProps {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
  subPeriodId?: string
}

export function PedagogicalAlertsCards({
  academicPeriodId,
  courseId,
  levelId,
  classId,
  subPeriodId,
}: PedagogicalAlertsCardsProps) {
  const query = { academicPeriodId, courseId, levelId, classId, subPeriodId }

  return (
    <DashboardCardBoundary
      title="Alertas Pedagógicos"
      queryKeys={[
        api.api.v1.dashboard.escolaPedagogicalAlerts.queryOptions({ query } as any).queryKey,
      ]}
    >
      <PedagogicalAlertsCardsContent
        academicPeriodId={academicPeriodId}
        courseId={courseId}
        levelId={levelId}
        classId={classId}
        subPeriodId={subPeriodId}
      />
    </DashboardCardBoundary>
  )
}

function PedagogicalAlertsCardsContent({
  academicPeriodId,
  courseId,
  levelId,
  classId,
  subPeriodId,
}: PedagogicalAlertsCardsProps) {
  const [selectedAlert, setSelectedAlert] = useState<PedagogicalAlertKey | null>(null)

  const { data, isLoading } = useQuery(
    api.api.v1.dashboard.escolaPedagogicalAlerts.queryOptions({
      query: { academicPeriodId, courseId, levelId, classId, subPeriodId },
    } as any)
  )

  const alerts = data?.alerts as PedagogicalAlerts | undefined

  if (isLoading || !alerts) {
    return <PedagogicalAlertsCardsSkeleton />
  }

  const visibleAlerts = alertConfigs.filter((config) => {
    const alertData = alerts[config.key]
    return alertData && alertData.count > 0
  })

  if (visibleAlerts.length === 0) {
    return (
      <Card>
        <CardContent className="py-7">
          <div className="min-h-[116px] text-center flex flex-col items-center justify-center">
            <CheckCircle className="mx-auto mb-3 h-10 w-10 text-green-500" />
            <h3 className="text-base font-semibold text-green-700">Tudo em ordem!</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Não há alertas pedagógicos no momento
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {visibleAlerts.map((config) => {
          const alertData = alerts[config.key]!
          const Icon = config.icon

          return (
            <Card
              key={config.key}
              className={cn(
                'cursor-pointer transition-colors border-l-4 border-l-transparent',
                config.bgClass
              )}
              onClick={() => setSelectedAlert(config.key)}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    {config.title}
                  </CardTitle>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{alertData.count}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {getAlertDescription(config.key, alertData)}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <PedagogicalAlertSheet
        alertKey={selectedAlert ?? 'studentsAtRiskByAttendance'}
        alerts={alerts}
        open={selectedAlert !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedAlert(null)
        }}
      />
    </>
  )
}

function getAlertDescription(
  key: PedagogicalAlertKey,
  data: NonNullable<PedagogicalAlerts[PedagogicalAlertKey]>
): string {
  if (key === 'studentsAtRiskByAttendance' && 'threshold' in data) {
    return `Alunos com frequência abaixo de ${data.threshold}% ou sem presença lançada em turmas com chamada`
  }
  if (key === 'studentsAtRiskByGrade' && 'minimumGrade' in data) {
    return `Alunos com pelo menos uma matéria abaixo de ${data.minimumGrade}`
  }
  if (key === 'examsWithoutGrades') {
    return 'Provas realizadas sem notas lançadas'
  }
  if (key === 'overdueActivities') {
    return 'Atividades vencidas com notas pendentes'
  }
  if (key === 'ungradedSubmissions') {
    return 'Alunos com notas pendentes de lançamento'
  }
  if (key === 'teachersMissingAttendance' && 'daysThreshold' in data) {
    return `Sem registro há ${data.daysThreshold}+ dias`
  }
  return ''
}

function PedagogicalAlertsCardsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-48 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
