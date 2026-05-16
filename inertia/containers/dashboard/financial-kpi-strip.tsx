import { useQuery } from '@tanstack/react-query'
import type { Route } from '@tuyau/core/types'

import { api } from '~/lib/api'
import { cn } from '~/lib/utils'
import { DashboardCardBoundary } from '~/components/dashboard-card-boundary'

type EscolaStatsResponse = Route.Response<'api.v1.dashboard.escola_stats'>

interface FinancialKpiStripProps {
  hideFinancialValues?: boolean
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
}

function formatBRL(amountCents: number): string {
  const reais = amountCents / 100
  if (Math.abs(reais) >= 1000) {
    return `R$ ${(reais / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
  }
  return `R$ ${reais.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

function StripSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 sm:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-card p-4">
          <div className="h-3 w-32 rounded bg-muted" />
          <div className="mt-2 h-7 w-24 rounded bg-muted" />
        </div>
      ))}
    </div>
  )
}

function StripCell({
  label,
  value,
  hint,
  tone,
}: {
  label: string
  value: string
  hint?: string
  tone?: 'default' | 'destructive'
}) {
  return (
    <div className="bg-card px-4 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </p>
      <p
        className={cn(
          'mt-1 text-xl font-semibold tabular-nums',
          tone === 'destructive' ? 'text-destructive' : 'text-foreground'
        )}
      >
        {value}
      </p>
      {hint ? <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  )
}

function StripContent({
  hideFinancialValues = false,
  academicPeriodId,
  courseId,
  levelId,
  classId,
}: FinancialKpiStripProps) {
  const query = { academicPeriodId, courseId, levelId, classId }
  const { data, isLoading } = useQuery(
    api.api.v1.dashboard.escolaStats.queryOptions({ query } as any)
  )

  if (isLoading || !data) {
    return <StripSkeleton />
  }

  const stats = data as EscolaStatsResponse
  const revenueCents = Number(stats.monthlyRevenue ?? 0) * 100
  const costCents = stats.payrollCosts?.totalCostCents ?? 0
  const resultCents = revenueCents - costCents
  const resultIsNegative = resultCents < 0
  const resultPrefix = resultCents > 0 ? '+' : resultCents < 0 ? '−' : ''
  const resultValue = `${resultPrefix}${formatBRL(Math.abs(resultCents))}`

  const obscured = (formatted: string) => (hideFinancialValues ? 'R$ ****' : formatted)

  let resultHint: string | undefined
  if (resultCents > 0) {
    resultHint = 'Receita acima do custo'
  } else if (resultCents < 0) {
    resultHint = `Falta ${obscured(formatBRL(Math.abs(resultCents)))} pra cobrir custo`
  } else {
    resultHint = 'No break-even'
  }

  return (
    <div className="grid grid-cols-1 gap-px overflow-hidden rounded-xl bg-border ring-1 ring-foreground/10 sm:grid-cols-3">
      <StripCell
        label="Receita prevista"
        value={obscured(formatBRL(revenueCents))}
        hint="Receita estimada no mês"
      />
      <StripCell
        label="Custo de folha"
        value={obscured(formatBRL(costCents))}
        hint="Professores, equipe e benefícios"
      />
      <StripCell
        label="Resultado operacional"
        value={obscured(resultValue)}
        hint={hideFinancialValues ? undefined : resultHint}
        tone={resultIsNegative ? 'destructive' : 'default'}
      />
    </div>
  )
}

export function FinancialKpiStrip(props: FinancialKpiStripProps) {
  return (
    <DashboardCardBoundary title="Indicadores financeiros">
      <StripContent {...props} />
    </DashboardCardBoundary>
  )
}
