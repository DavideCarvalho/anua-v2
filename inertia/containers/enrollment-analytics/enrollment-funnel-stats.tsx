import { useSuspenseQuery } from '@tanstack/react-query'
import { Users, FileCheck, Clock, FileSignature, CheckCircle, XCircle } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/card'
import { Progress } from '../../components/ui/progress'

import { useEnrollmentFunnelStatsQueryOptions } from '../../hooks/queries/use_enrollment_funnel_stats'

interface EnrollmentFunnelStatsProps {
  schoolId?: string
  academicPeriodId?: string
}

export function EnrollmentFunnelStats({ schoolId, academicPeriodId }: EnrollmentFunnelStatsProps) {
  const { data } = useSuspenseQuery(
    useEnrollmentFunnelStatsQueryOptions({ schoolId, academicPeriodId })
  )

  const stats = [
    {
      label: 'Total de Matrículas',
      value: data.totalEnrollments,
      icon: Users,
      color: 'text-blue-600',
    },
    {
      label: 'Aguardando Documentos',
      value: data.pendingDocuments,
      icon: FileCheck,
      color: 'text-amber-600',
    },
    {
      label: 'Matrículas Concluídas',
      value: data.completed,
      icon: CheckCircle,
      color: 'text-green-600',
    },
    {
      label: 'Aguardando Assinatura',
      value: data.pendingSignatures,
      icon: Clock,
      color: 'text-orange-600',
    },
    {
      label: 'Contratos Assinados',
      value: data.signedContracts,
      icon: FileSignature,
      color: 'text-emerald-600',
    },
    {
      label: 'Assinaturas Recusadas',
      value: data.declinedSignatures,
      icon: XCircle,
      color: 'text-red-600',
    },
  ]

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.label}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Conversion metrics */}
      <Card>
        <CardHeader>
          <CardTitle>Métricas de Conversão</CardTitle>
          <CardDescription>Análise do funil de matrículas</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Taxa de Conversão</span>
              <span className="font-medium text-green-600">{data.conversionRate}%</span>
            </div>
            <Progress value={data.conversionRate} className="h-2" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Taxa de Abandono</span>
              <span className="font-medium text-red-600">{data.dropOffRate}%</span>
            </div>
            <Progress value={data.dropOffRate} className="h-2 [&>div]:bg-red-500" />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span>Taxa de Assinatura</span>
              <span className="font-medium text-blue-600">{data.signatureCompletionRate}%</span>
            </div>
            <Progress value={data.signatureCompletionRate} className="h-2 [&>div]:bg-blue-500" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export function EnrollmentFunnelStatsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 w-24 bg-muted animate-pulse rounded" />
              <div className="h-4 w-4 bg-muted animate-pulse rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-muted animate-pulse rounded" />
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="h-5 w-40 bg-muted animate-pulse rounded" />
          <div className="h-4 w-56 bg-muted animate-pulse rounded mt-2" />
        </CardHeader>
        <CardContent className="space-y-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-muted animate-pulse rounded" />
                <div className="h-4 w-12 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-2 bg-muted animate-pulse rounded" />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
