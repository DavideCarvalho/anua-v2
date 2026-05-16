import { useQuery } from '@tanstack/react-query'

import { api } from '~/lib/api'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'

interface EnrollmentConversionStripProps {
  schoolId?: string
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

function StripSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card p-4">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="mt-2 h-7 w-16 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function StripCell({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-xl font-semibold tabular-nums text-foreground">{value}</p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function StripContent({
  schoolId,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: EnrollmentConversionStripProps) {
  const { data, isLoading } = useQuery(
    api.api.v1.analytics.enrollments.funnel.queryOptions({
      query: { schoolId, academicPeriodId, courseId, levelId, classId },
    })
  )

  if (isLoading || !data) {
    return <StripSkeleton />
  }

  const fmt = (rate: number) => `${rate.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 sm:grid-cols-3">
      <StripCell
        label="No funil"
        value={data.totalEnrollments.toLocaleString('pt-BR')}
        hint="Total de matrículas no período ativo"
      />
      <StripCell
        label="Concluídas"
        value={data.completed.toLocaleString('pt-BR')}
        hint={`${data.pendingDocuments} aguardando documentos`}
      />
      <StripCell
        label="Taxa de conversão"
        value={fmt(data.conversionRate)}
        hint={`${data.completed} de ${data.totalEnrollments} concluídas`}
      />
    </div>
  )
}

export function EnrollmentConversionStrip(props: EnrollmentConversionStripProps) {
  return (
    <DashboardCardBoundary title="Conversão de matrículas">
      <StripContent {...props} />
    </DashboardCardBoundary>
  )
}
