import { useQuery } from '@tanstack/react-query'
import { Link } from '@adonisjs/inertia/react'
import {
  AlertCircle,
  Bell,
  CalendarCheck,
  CheckCircle,
  DollarSign,
  FileText,
  GraduationCap,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { api } from '~/lib/api'
import { Card, CardContent, CardHeader, CardTitle } from '~/components/ui/card'
import { cn } from '~/lib/utils'
import { formatCurrency } from '~/lib/utils'
import type { Route } from '@tuyau/core/types'

type AlertsResponse = Route.Response<'api.v1.dashboard.responsavel_alerts'>

interface ResponsavelInsightsCardsProps {
  studentId?: string | null
}

type AlertTone = 'danger' | 'warning' | 'info' | 'success'

const toneClass: Record<AlertTone, string> = {
  danger: 'border-l-destructive bg-destructive/10 hover:bg-destructive/20',
  warning: 'border-l-amber-500 bg-amber-500/10 hover:bg-amber-500/20',
  info: 'border-l-blue-500 bg-blue-500/10 hover:bg-blue-500/20',
  success: 'border-l-green-600 bg-green-600/10 hover:bg-green-600/20',
}

const iconClass: Record<AlertTone, string> = {
  danger: 'text-destructive',
  warning: 'text-amber-500',
  info: 'text-blue-500',
  success: 'text-green-600',
}

/**
 * 5 cards de insight pro responsável — análogo ao PedagogicalAlertsCards do
 * /escola. Cada card só renderiza quando tem sinal (count > 0 ou perfectWeek).
 *
 * studentId: quando passado, restringe os counts a esse filho. Quando null,
 * agrega across todos os filhos do pai (caso com múltiplos filhos no select).
 */
export function ResponsavelInsightsCards({ studentId }: ResponsavelInsightsCardsProps) {
  const { data, isLoading } = useQuery(
    api.api.v1.dashboard.responsavelAlerts.queryOptions({
      query: studentId ? { studentId } : {},
    })
  )

  if (isLoading || !data) {
    return <InsightsSkeleton />
  }

  const { alerts } = data as AlertsResponse
  const cards: VisibleCard[] = []

  if (alerts.pendingAssignments.count > 0) {
    cards.push({
      key: 'pending',
      icon: FileText,
      tone: alerts.pendingAssignments.count > 3 ? 'warning' : 'info',
      title: 'Atividades pendentes',
      value: String(alerts.pendingAssignments.count),
      subtitle: 'Entregas até o fim da semana',
      breakdown: breakdownText(
        alerts.pendingAssignments.breakdown.map((b) => ({ studentName: b.studentName, n: b.count }))
      ),
      href: '/responsavel/atividades',
    })
  }

  if (alerts.weeklyAttendance) {
    if (alerts.weeklyAttendance.absences > 1) {
      cards.push({
        key: 'attendance-bad',
        icon: AlertCircle,
        tone: 'danger',
        title: 'Faltas essa semana',
        value: String(alerts.weeklyAttendance.absences),
        subtitle: `de ${alerts.weeklyAttendance.total} aulas registradas`,
        breakdown: breakdownText(
          alerts.weeklyAttendance.breakdown
            .filter((b) => b.absences > 0)
            .map((b) => ({ studentName: b.studentName, n: b.absences }))
        ),
        href: '/responsavel/frequencia',
      })
    } else if (alerts.weeklyAttendance.perfectWeek) {
      cards.push({
        key: 'attendance-good',
        icon: CheckCircle,
        tone: 'success',
        title: 'Semana perfeita',
        value: '0 faltas',
        subtitle: `${alerts.weeklyAttendance.total} aulas com presença`,
        breakdown: null,
        href: '/responsavel/frequencia',
      })
    }
  }

  if (alerts.newGrades.count > 0 && alerts.newGrades.lastGrade) {
    const last = alerts.newGrades.lastGrade
    const pct = last.maxScore > 0 ? last.score / last.maxScore : 0
    const tone: AlertTone = pct < 0.5 ? 'warning' : 'info'
    cards.push({
      key: 'new-grades',
      icon: GraduationCap,
      tone,
      title: 'Notas novas',
      value: String(alerts.newGrades.count),
      subtitle: `Última: ${last.subject} · ${formatScore(last.score)}/${formatScore(last.maxScore)}`,
      breakdown: breakdownText(
        alerts.newGrades.breakdown.map((b) => ({ studentName: b.studentName, n: b.count }))
      ),
      href: '/responsavel/notas',
    })
  }

  if (alerts.unreadCommunications.count > 0) {
    cards.push({
      key: 'comunicados',
      icon: Bell,
      tone: 'warning',
      title: 'Comunicados aguardando ciência',
      value: String(alerts.unreadCommunications.count),
      subtitle: alerts.unreadCommunications.lastTitle ?? 'Confirme leitura',
      breakdown: breakdownText(
        alerts.unreadCommunications.breakdown.map((b) => ({
          studentName: b.studentName,
          n: b.count,
        }))
      ),
      href: '/responsavel/comunicados',
    })
  }

  if (alerts.openInvoices && alerts.openInvoices.count > 0) {
    const next = alerts.openInvoices.nextDueDate
    cards.push({
      key: 'invoices',
      icon: DollarSign,
      tone: 'warning',
      title: 'Boletos abertos',
      value: formatCurrency(alerts.openInvoices.totalCents),
      subtitle: next
        ? `Próximo vencimento: ${formatDateShort(next)}`
        : `${alerts.openInvoices.count} boleto(s) em aberto`,
      breakdown: breakdownText(
        alerts.openInvoices.breakdown.map((b) => ({ studentName: b.studentName, n: b.count }))
      ),
      href: '/responsavel/mensalidades',
    })
  }

  if (cards.length === 0) {
    return (
      <Card>
        <CardContent className="py-7">
          <div className="flex min-h-[116px] flex-col items-center justify-center text-center">
            <CalendarCheck className="mx-auto mb-3 h-10 w-10 text-green-600" />
            <h3 className="text-base font-semibold text-green-700">Nada por aqui agora</h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Sem pendências ou novidades nessa semana
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {cards.map((card) => {
        const Icon = card.icon
        return (
          <Link key={card.key} href={card.href} className="block">
            <Card
              className={cn(
                'h-full cursor-pointer border-l-4 border-l-transparent transition-colors',
                toneClass[card.tone]
              )}
            >
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-sm font-medium">
                  <Icon className={cn('h-4 w-4', iconClass[card.tone])} />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{card.value}</div>
                <p className="mt-1 text-xs text-muted-foreground">{card.subtitle}</p>
                {card.breakdown ? (
                  <p className="mt-1 text-xs text-muted-foreground/80">{card.breakdown}</p>
                ) : null}
              </CardContent>
            </Card>
          </Link>
        )
      })}
    </div>
  )
}

interface VisibleCard {
  key: string
  icon: LucideIcon
  tone: AlertTone
  title: string
  value: string
  subtitle: string
  breakdown: string | null
  href: string
}

function InsightsSkeleton() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {[1, 2, 3].map((i) => (
        <Card key={i} className="h-full">
          <CardHeader className="pb-2">
            <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          </CardHeader>
          <CardContent>
            <div className="h-8 w-16 animate-pulse rounded bg-muted" />
            <div className="mt-2 h-3 w-40 animate-pulse rounded bg-muted" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/**
 * "Maria: 2 · João: 1" pra cards no modo agregado. Retorna null quando
 * houver só 1 filho com sinal (sem ambiguidade) ou nenhum.
 */
function breakdownText(items: Array<{ studentName: string; n: number }>): string | null {
  const nonZero = items.filter((i) => i.n > 0)
  if (nonZero.length <= 1) return null
  return nonZero.map((i) => `${i.studentName.split(' ')[0]}: ${i.n}`).join(' · ')
}

function formatScore(n: number): string {
  return n % 1 === 0 ? String(n) : n.toFixed(1)
}

function formatDateShort(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
}
