import { Head } from '@inertiajs/react'
import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Coins, Cpu, Building2, Users } from 'lucide-react'
import { AdminLayout } from '../../../components/layouts'
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card'
import { Badge } from '../../../components/ui/badge'
import { cn } from '../../../lib/utils'
import { api } from '../../../lib/api'

const RANGES = [
  { label: '7d', days: 7 },
  { label: '30d', days: 30 },
  { label: '90d', days: 90 },
] as const

type GroupRow = {
  key: string
  label: string
  inputTokens: number
  outputTokens: number
  totalTokens: number
  count: number
}

type SchoolRow = GroupRow & {
  monthlyUsed: number
  monthlyLimit: number | null
  quotaStatus: 'unlimited' | 'ok' | 'warning' | 'exceeded'
}

type DailyRow = { day: string; inputTokens: number; outputTokens: number; totalTokens: number }

function fmt(n: number): string {
  return n.toLocaleString('pt-BR')
}

function StatCard({
  icon: Icon,
  label,
  value,
  hint,
}: {
  icon: React.ComponentType<{ className?: string }>
  label: string
  value: string
  hint?: string
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
          <Icon className="h-3.5 w-3.5" />
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-semibold tabular-nums">{value}</div>
        {hint ? <div className="mt-1 text-xs text-muted-foreground">{hint}</div> : null}
      </CardContent>
    </Card>
  )
}

function GroupTable({
  title,
  icon: Icon,
  rows,
  emptyLabel = 'Sem dados no período',
}: {
  title: string
  icon: React.ComponentType<{ className?: string }>
  rows: GroupRow[]
  emptyLabel?: string
}) {
  const totalSum = rows.reduce((acc, r) => acc + r.totalTokens, 0)
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Icon className="h-4 w-4 text-muted-foreground" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">{emptyLabel}</div>
        ) : (
          <div className="space-y-2">
            {rows.map((r) => {
              const pct = totalSum > 0 ? (r.totalTokens / totalSum) * 100 : 0
              return (
                <div key={r.key} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="truncate text-foreground" title={r.label}>
                      {r.label}
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {fmt(r.totalTokens)} tokens · {fmt(r.count)} req
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

const QUOTA_BADGE: Record<
  SchoolRow['quotaStatus'],
  { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }
> = {
  unlimited: { label: 'Sem limite', variant: 'outline' },
  ok: { label: 'Ok', variant: 'secondary' },
  warning: { label: '≥80%', variant: 'default' },
  exceeded: { label: 'Estourou', variant: 'destructive' },
}

function SchoolUsageTable({
  rows,
}: {
  rows: SchoolRow[]
}) {
  const maxWindow = Math.max(...rows.map((r) => r.totalTokens), 1)
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-sm font-medium">
          <Building2 className="h-4 w-4 text-muted-foreground" />
          Top 20 escolas
        </CardTitle>
      </CardHeader>
      <CardContent>
        {rows.length === 0 ? (
          <div className="py-6 text-center text-xs text-muted-foreground">
            Sem dados no período
          </div>
        ) : (
          <div className="space-y-2.5">
            {rows.map((r) => {
              const pct = (r.totalTokens / maxWindow) * 100
              const badge = QUOTA_BADGE[r.quotaStatus]
              const monthlyPct =
                r.monthlyLimit && r.monthlyLimit > 0
                  ? Math.min(100, (r.monthlyUsed / r.monthlyLimit) * 100)
                  : null
              return (
                <div key={r.key} className="space-y-1">
                  <div className="flex items-baseline justify-between gap-2 text-xs">
                    <span className="flex items-center gap-2 truncate text-foreground" title={r.label}>
                      <span className="truncate">{r.label}</span>
                      <Badge variant={badge.variant} className="text-[9px]">
                        {badge.label}
                      </Badge>
                    </span>
                    <span className="shrink-0 tabular-nums text-muted-foreground">
                      {fmt(r.totalTokens)} tokens · {fmt(r.count)} req
                    </span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${Math.max(2, pct)}%` }}
                    />
                  </div>
                  {monthlyPct !== null && r.monthlyLimit !== null ? (
                    <div className="flex items-center justify-between gap-2 text-[10px] text-muted-foreground">
                      <span>
                        Mês: {fmt(r.monthlyUsed)} / {fmt(r.monthlyLimit)}
                      </span>
                      <span className="tabular-nums">{monthlyPct.toFixed(0)}%</span>
                    </div>
                  ) : (
                    <div className="text-[10px] text-muted-foreground">
                      Mês: {fmt(r.monthlyUsed)} tokens (sem teto)
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function DailySparkline({ rows }: { rows: DailyRow[] }) {
  if (rows.length === 0) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-xs text-muted-foreground">
          Sem consumo no período
        </CardContent>
      </Card>
    )
  }
  const max = Math.max(...rows.map((r) => r.totalTokens), 1)
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Consumo diário</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-end gap-1 h-32">
          {rows.map((r) => {
            const h = (r.totalTokens / max) * 100
            return (
              <div
                key={r.day}
                className="group relative flex-1 min-w-[3px]"
                title={`${r.day}: ${fmt(r.totalTokens)} tokens`}
              >
                <div
                  className="w-full rounded-sm bg-primary/70 transition-colors group-hover:bg-primary"
                  style={{ height: `${Math.max(2, h)}%` }}
                />
              </div>
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-muted-foreground">
          <span>{rows[0]?.day}</span>
          <span>{rows[rows.length - 1]?.day}</span>
        </div>
      </CardContent>
    </Card>
  )
}

export default function AiTokensPage() {
  const [days, setDays] = useState<number>(30)

  const { data, isLoading, error } = useQuery(
    api.api.v1.admin.ai.tokens.summary.queryOptions({ query: { days } })
  )

  const totals = data?.totals ?? { inputTokens: 0, outputTokens: 0, totalTokens: 0, count: 0 }
  const daily = (data?.daily ?? []) as DailyRow[]
  const byModel = (data?.byModel ?? []) as GroupRow[]
  const byPurpose = (data?.byPurpose ?? []) as GroupRow[]
  const bySchool = (data?.bySchool ?? []) as SchoolRow[]
  const byUser = (data?.byUser ?? []) as GroupRow[]

  return (
    <AdminLayout>
      <Head title="Consumo de IA" />

      <div className="space-y-6">
        <div className="flex items-baseline justify-between">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Coins className="h-6 w-6 text-primary" />
              Consumo de IA
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Tokens gastos pelo assistente (chat, geração de título, sumarização) por
              modelo, propósito, escola e usuário. Dados em tempo real conforme as
              requisições acontecem.
            </p>
          </div>
          <div className="flex gap-1 rounded-md border border-border p-1">
            {RANGES.map((r) => (
              <button
                key={r.days}
                type="button"
                onClick={() => setDays(r.days)}
                className={cn(
                  'px-2.5 py-1 text-xs font-medium rounded transition-colors',
                  days === r.days
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {error ? (
          <Card>
            <CardContent className="p-4 text-sm text-destructive">
              Falha ao carregar dados de consumo.
            </CardContent>
          </Card>
        ) : null}

        {isLoading ? (
          <div className="flex h-48 items-center justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
              <StatCard
                icon={Coins}
                label="Tokens totais"
                value={fmt(totals.totalTokens)}
                hint={`${fmt(totals.count)} requisições`}
              />
              <StatCard
                icon={Cpu}
                label="Input"
                value={fmt(totals.inputTokens)}
              />
              <StatCard
                icon={Cpu}
                label="Output"
                value={fmt(totals.outputTokens)}
              />
              <StatCard
                icon={Building2}
                label="Escolas ativas"
                value={String(bySchool.length)}
                hint="Com ao menos 1 requisição"
              />
            </div>

            <DailySparkline rows={daily} />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <GroupTable title="Por modelo" icon={Cpu} rows={byModel} />
              <GroupTable title="Por propósito" icon={Coins} rows={byPurpose} />
              <SchoolUsageTable rows={bySchool} />
              <GroupTable title="Top 20 usuários" icon={Users} rows={byUser} />
            </div>
          </>
        )}
      </div>
    </AdminLayout>
  )
}
