import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, AlertCircle, Info, CheckCircle } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { Badge } from '~/components/ui/badge'

interface CourseAlertsProps {
  courseId: string
  academicPeriodId: string
}

interface AlertData {
  type: string
  severity: 'critical' | 'warning' | 'info'
  message: string
  data: Record<string, unknown>
}

interface AlertsResponse {
  critical: AlertData[]
  warning: AlertData[]
  info: AlertData[]
  totalAlerts: number
}

async function fetchAlerts(courseId: string, academicPeriodId: string): Promise<AlertsResponse> {
  const response = await fetch(
    `/api/v1/courses/${courseId}/academic-periods/${academicPeriodId}/dashboard/alerts`
  )
  if (!response.ok) {
    throw new Error('Failed to fetch alerts')
  }
  return response.json()
}

function CourseAlertsSkeleton() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 animate-pulse text-muted-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Carregando alertas...</p>
        </div>
      </CardContent>
    </Card>
  )
}

function CourseAlertsError() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5" />
          Alertas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="py-12 text-center">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive" />
          <h3 className="mt-4 text-lg font-semibold text-destructive">Erro ao carregar alertas</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            Não foi possível carregar os alertas.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

export function CourseAlerts({ courseId, academicPeriodId }: CourseAlertsProps) {
  const {
    data: alerts,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['course-dashboard-alerts', courseId, academicPeriodId],
    queryFn: () => fetchAlerts(courseId, academicPeriodId),
  })

  if (isLoading) {
    return <CourseAlertsSkeleton />
  }

  if (isError || !alerts) {
    return <CourseAlertsError />
  }

  if (alerts.totalAlerts === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            Alertas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="py-12 text-center">
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
            <h3 className="mt-4 text-lg font-semibold">Tudo certo!</h3>
            <p className="mt-2 text-sm text-muted-foreground">Não há alertas no momento.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas
          </span>
          <Badge variant="secondary">{alerts.totalAlerts}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Critical Alerts */}
        {alerts.critical.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-destructive">Críticos</h4>
            {alerts.critical.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-destructive/50 bg-destructive/5 p-3"
              >
                <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-destructive" />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Warning Alerts */}
        {alerts.warning.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-orange-600">Avisos</h4>
            {alerts.warning.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-orange-500/50 bg-orange-500/5 p-3"
              >
                <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-orange-600" />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}

        {/* Info Alerts */}
        {alerts.info.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-blue-600">Informações</h4>
            {alerts.info.map((alert, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 rounded-lg border border-blue-500/50 bg-blue-500/5 p-3"
              >
                <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-600" />
                <p className="text-sm">{alert.message}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
