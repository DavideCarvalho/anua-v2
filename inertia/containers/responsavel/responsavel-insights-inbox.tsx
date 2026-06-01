import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from '@adonisjs/inertia/react'
import { ArrowRight, Sparkles } from 'lucide-react'
import { api } from '~/lib/api'
import { Badge } from '~/components/ui/badge'
import { cn } from '~/lib/utils'
import { formatCurrency } from '~/lib/utils'
import type { Route } from '@tuyau/core/types'

type AlertsResponse = Route.Response<'api.v1.dashboard.responsavel_alerts'>

type Severity = 'critical' | 'warn' | 'info'

interface InsightItem {
  id: string
  severity: Severity
  title: string
  subtitle: string
  route: string
  action: string
}

interface ResponsavelInsightsInboxProps {
  studentId?: string | null
}

const SEVERITY_LABEL: Record<Severity, string> = {
  critical: 'Crítico',
  warn: 'Atenção',
  info: 'Para acompanhar',
}

const dotClass: Record<Severity, string> = {
  critical: 'bg-destructive',
  warn: 'bg-destructive/60',
  info: 'bg-muted-foreground/50',
}

const ringClass: Record<Severity, string> = {
  critical: 'ring-destructive/30',
  warn: 'ring-destructive/15',
  info: 'ring-transparent',
}

const severityOrder: Record<Severity, number> = { critical: 0, warn: 1, info: 2 }

/**
 * Espelha o AttentionInbox do /escola pro /responsavel: card único com header
 * "Insights", lista de items por severidade, dot ao invés de stripe colorido.
 *
 * Items vêm do GET /api/v1/responsavel/alerts (1 round-trip, 5 categorias).
 * Cada item vira um Link pra rota dedicada do tema. Sem drawer v1; quem quer
 * detalhe entra na página.
 */
export function ResponsavelInsightsInbox({ studentId }: ResponsavelInsightsInboxProps) {
  const { data, isLoading } = useQuery(
    api.api.v1.dashboard.responsavelAlerts.queryOptions({
      query: studentId ? { studentId } : {},
    })
  )

  const items = useMemo<InsightItem[]>(() => {
    if (!data) return []
    return buildItems(data as AlertsResponse)
  }, [data])

  return (
    <section
      aria-labelledby="responsavel-insights-heading"
      className="overflow-hidden rounded-xl border border-border bg-card"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Sparkles aria-hidden className="h-4 w-4 text-primary" />
          <h2 id="responsavel-insights-heading" className="text-sm font-medium text-foreground">
            Insights
          </h2>
        </div>
        {items.length > 0 ? (
          <Badge variant="secondary" className="px-2 py-0 text-[11px] font-medium tabular-nums">
            {items.length}
          </Badge>
        ) : null}
      </div>

      <div>
        {isLoading && items.length === 0 ? (
          <InboxSkeleton />
        ) : items.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <p className="text-sm font-medium text-foreground">Tudo em dia.</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Nenhum item pede sua atenção agora.
            </p>
          </div>
        ) : (
          <Body items={items} />
        )}
      </div>
    </section>
  )
}

function Body({ items }: { items: InsightItem[] }) {
  let lastSeverity: Severity | null = null
  return (
    <div className="px-4 py-3 space-y-1">
      {items.map((item) => {
        const severityChanged = item.severity !== lastSeverity
        lastSeverity = item.severity
        return (
          <div key={item.id}>
            {severityChanged ? (
              <div className="mt-3 mb-1 px-3 -mx-3 text-[11px] font-medium uppercase tracking-wider text-muted-foreground first:mt-0">
                {SEVERITY_LABEL[item.severity]}
              </div>
            ) : null}
            <InsightRow item={item} />
          </div>
        )
      })}
    </div>
  )
}

function InsightRow({ item }: { item: InsightItem }) {
  return (
    <Link
      href={item.route}
      className={cn(
        'group flex w-full items-start gap-3 rounded-lg px-3 py-3 -mx-3 text-left',
        'transition-colors duration-150 cursor-pointer',
        'hover:bg-muted/60 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-ring/50'
      )}
    >
      <span
        aria-hidden
        className={cn(
          'mt-1.5 h-2 w-2 shrink-0 rounded-full ring-3',
          dotClass[item.severity],
          ringClass[item.severity]
        )}
      />

      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-snug text-foreground">{item.title}</p>
        <p className="mt-0.5 text-xs text-muted-foreground leading-relaxed">{item.subtitle}</p>
      </div>

      <span
        className={cn(
          'flex shrink-0 items-center gap-1 self-center text-xs font-medium text-primary',
          'opacity-70 transition-opacity group-hover:opacity-100'
        )}
      >
        {item.action}
        <ArrowRight className="h-3.5 w-3.5" />
      </span>
    </Link>
  )
}

function InboxSkeleton() {
  return (
    <div className="px-4 py-3 space-y-3">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-start gap-3 px-3 -mx-3 py-2">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-muted ring-3 ring-transparent" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3.5 w-3/4 animate-pulse rounded bg-muted" />
            <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Mapeia o payload de alerts pros items da inbox. Ordenado por severidade
 * (critical → warn → info). Items só aparecem quando há sinal — count > 0,
 * perfectWeek true, etc.
 */
function buildItems(data: AlertsResponse): InsightItem[] {
  const items: InsightItem[] = []
  const { alerts } = data

  if (alerts.pendingAssignments.count > 0) {
    items.push({
      id: 'pending-assignments',
      severity: alerts.pendingAssignments.count > 3 ? 'warn' : 'info',
      title: `${alerts.pendingAssignments.count} ${alerts.pendingAssignments.count === 1 ? 'atividade' : 'atividades'} sem entrega`,
      subtitle: 'Prazo até o fim da semana',
      route: '/responsavel/atividades',
      action: 'Ver',
    })
  }

  // Provas próximas — gatilho central do card: mãe sabia que a prova existe,
  // mas pode estar achando que "não tem nada na agenda" porque entrou cedo
  // demais. O insight repete a info no dashboard onde ela já está.
  if (alerts.upcomingExams && alerts.upcomingExams.next) {
    const next = alerts.upcomingExams.next
    const severity: Severity =
      next.daysUntil <= 2 ? 'critical' : next.daysUntil <= 4 ? 'warn' : 'info'
    const whenLabel =
      next.daysUntil === 0 ? 'hoje' : next.daysUntil === 1 ? 'amanhã' : `em ${next.daysUntil} dias`
    const countLabel =
      alerts.upcomingExams.count === 1 ? '1 prova' : `${alerts.upcomingExams.count} provas`
    const subjectPart = next.subject ? ` · ${next.subject}` : ''
    items.push({
      id: 'upcoming-exams',
      severity,
      title: `${countLabel} nos próximos 7 dias`,
      subtitle: `Próxima: ${next.title}${subjectPart} (${whenLabel})`,
      route: '/responsavel/calendario',
      action: 'Ver',
    })
  }

  // Risco cumulativo de frequência (30 dias) tem prioridade sobre "faltas
  // essa semana" — é o sinal estrutural que pode levar a reprovação. Se o
  // aluno está em risco, mostra só esse; se não, mostra o weekly como antes.
  if (
    alerts.attendanceRisk &&
    alerts.attendanceRisk.atRiskCount > 0 &&
    alerts.attendanceRisk.worst
  ) {
    const worst = alerts.attendanceRisk.worst
    items.push({
      id: 'attendance-risk',
      severity: 'critical',
      title: `Frequência em risco: ${worst.percentage}%`,
      subtitle: `Limite mínimo da escola: ${alerts.attendanceRisk.threshold}%`,
      route: '/responsavel/frequencia',
      action: 'Ver',
    })
  } else if (alerts.weeklyAttendance) {
    if (alerts.weeklyAttendance.absences > 1) {
      items.push({
        id: 'attendance-bad',
        severity: 'critical',
        title: `${alerts.weeklyAttendance.absences} faltas essa semana`,
        subtitle: `de ${alerts.weeklyAttendance.total} aulas registradas`,
        route: '/responsavel/frequencia',
        action: 'Ver',
      })
    } else if (alerts.weeklyAttendance.perfectWeek) {
      items.push({
        id: 'attendance-good',
        severity: 'info',
        title: 'Frequência em dia',
        subtitle: `${alerts.weeklyAttendance.total} aulas sem faltas essa semana`,
        route: '/responsavel/frequencia',
        action: 'Ver',
      })
    }
  }

  if (alerts.newGrades.count > 0 && alerts.newGrades.lastGrade) {
    const last = alerts.newGrades.lastGrade
    const pct = last.maxScore > 0 ? last.score / last.maxScore : 0
    items.push({
      id: 'new-grades',
      severity: pct < 0.5 ? 'warn' : 'info',
      title: `${alerts.newGrades.count} ${alerts.newGrades.count === 1 ? 'nota nova' : 'notas novas'}`,
      subtitle: `Última: ${last.subject}, ${formatScore(last.score)}/${formatScore(last.maxScore)}`,
      route: '/responsavel/notas',
      action: 'Ver',
    })
  }

  if (alerts.unreadCommunications.count > 0) {
    items.push({
      id: 'unread-comm',
      severity: 'warn',
      title: `${alerts.unreadCommunications.count} ${alerts.unreadCommunications.count === 1 ? 'comunicado' : 'comunicados'} aguardando ciência`,
      subtitle: alerts.unreadCommunications.lastTitle ?? 'Confirme leitura',
      route: '/responsavel/comunicados',
      action: 'Ver',
    })
  }

  if (alerts.openInvoices && alerts.openInvoices.count > 0) {
    const due = alerts.openInvoices.nextDueDate
    items.push({
      id: 'open-invoices',
      severity: 'warn',
      title: `${formatCurrency(alerts.openInvoices.totalCents)} em boletos abertos`,
      subtitle: due
        ? `Próximo vencimento: ${formatDateShort(due)}`
        : `${alerts.openInvoices.count} ${alerts.openInvoices.count === 1 ? 'boleto' : 'boletos'} em aberto`,
      route: '/responsavel/mensalidades',
      action: 'Ver',
    })
  }

  return items.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity])
}

function formatScore(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
