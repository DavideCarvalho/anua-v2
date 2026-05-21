import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { Route } from '@tuyau/core/types'

import { api } from '~/lib/api'
import type { PedagogicalAlerts } from '../pedagogical-alert-sheet'
import type { AttentionItem } from './types'
import { SEVERITY_ORDER } from './types'

export interface AttentionInboxFilters {
  academicPeriodId?: string
  courseId?: string
  levelId?: string
  classId?: string
  subPeriodId?: string
}

export interface AttentionInboxScope {
  showFinancial?: boolean
  showEnrollment?: boolean
}

type EscolaStatsResponse = Route.Response<'api.v1.dashboard.escola_stats'>
export type OverdueAging = EscolaStatsResponse['overdueAging']

type EnrollmentFunnelResponse = Route.Response<'api.v1.analytics.enrollments.funnel'>
export type EnrollmentFunnel = EnrollmentFunnelResponse

interface UseAttentionItemsResult {
  items: AttentionItem[]
  isLoading: boolean
  isAllLoaded: boolean
  pedagogicalAlerts: PedagogicalAlerts | undefined
  overdueAging: OverdueAging | undefined
  enrollmentFunnel: EnrollmentFunnel | undefined
}

export function formatBRL(amountCents: number): string {
  const reais = amountCents / 100
  if (reais >= 1000) {
    return `R$ ${(reais / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 })}k`
  }
  return `R$ ${reais.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}`
}

export function useAttentionItems(
  filters: AttentionInboxFilters,
  scope: AttentionInboxScope = { showFinancial: true, showEnrollment: true }
): UseAttentionItemsResult {
  const { showFinancial = true, showEnrollment = true } = scope
  const query = {
    academicPeriodId: filters.academicPeriodId,
    courseId: filters.courseId,
    levelId: filters.levelId,
    classId: filters.classId,
    subPeriodId: filters.subPeriodId,
  }

  const pedagogicalAlertsQuery = useQuery(
    api.api.v1.dashboard.escolaPedagogicalAlerts.queryOptions({ query } as any)
  )

  const enrollmentFunnelQuery = useQuery({
    ...api.api.v1.analytics.enrollments.funnel.queryOptions({
      query: {
        academicPeriodId: filters.academicPeriodId,
        courseId: filters.courseId,
        levelId: filters.levelId,
        classId: filters.classId,
      },
    }),
    enabled: showEnrollment,
  })

  const escolaStatsQuery = useQuery({
    ...api.api.v1.dashboard.escolaStats.queryOptions({
      query: {
        academicPeriodId: filters.academicPeriodId,
        courseId: filters.courseId,
        levelId: filters.levelId,
        classId: filters.classId,
      },
    } as any),
    enabled: showFinancial,
  })

  const items = useMemo<AttentionItem[]>(() => {
    const collected: AttentionItem[] = []

    const alerts = pedagogicalAlertsQuery.data?.alerts
    if (alerts) {
      if (alerts.studentsAtRiskByAttendance && alerts.studentsAtRiskByAttendance.count > 0) {
        const { count, threshold } = alerts.studentsAtRiskByAttendance
        collected.push({
          id: 'pedagogical:attendance-risk',
          severity: 'critical',
          category: 'pedagogical',
          title: `${count} aluno${count > 1 ? 's' : ''} em risco por frequência`,
          subtitle: `Abaixo de ${threshold}% de presença em turmas com chamada`,
          count,
          route: 'web.escola.pedagogico.presenca',
          destinationLabel: 'presença',
          action: 'Ver alunos',
          pedagogicalAlertKey: 'studentsAtRiskByAttendance',
        })
      }

      if (alerts.studentsAtRiskByGrade && alerts.studentsAtRiskByGrade.count > 0) {
        const { count, minimumGrade } = alerts.studentsAtRiskByGrade
        collected.push({
          id: 'pedagogical:grade-risk',
          severity: 'critical',
          category: 'pedagogical',
          title: `${count} aluno${count > 1 ? 's' : ''} em risco por nota`,
          subtitle: `Pelo menos uma matéria abaixo de ${minimumGrade}`,
          count,
          route: 'web.escola.administrativo.alunos',
          destinationLabel: 'alunos',
          action: 'Ver alunos',
          pedagogicalAlertKey: 'studentsAtRiskByGrade',
        })
      }

      if (alerts.teachersMissingAttendance && alerts.teachersMissingAttendance.count > 0) {
        const { count, daysThreshold } = alerts.teachersMissingAttendance
        collected.push({
          id: 'pedagogical:teachers-no-attendance',
          severity: 'critical',
          category: 'pedagogical',
          title: `${count} professor${count > 1 ? 'es' : ''} sem lançar presença`,
          subtitle: `Sem registro há ${daysThreshold} dias ou mais`,
          count,
          route: 'web.escola.administrativo.professores',
          destinationLabel: 'professores',
          action: 'Cobrar',
          pedagogicalAlertKey: 'teachersMissingAttendance',
        })
      }

      if (alerts.examsWithoutGrades && alerts.examsWithoutGrades.count > 0) {
        const { count } = alerts.examsWithoutGrades
        collected.push({
          id: 'pedagogical:exams-no-grades',
          severity: 'warn',
          category: 'pedagogical',
          title: `${count} prova${count > 1 ? 's' : ''} sem notas lançadas`,
          subtitle: 'Provas realizadas mas pendentes de correção',
          count,
          action: 'Ver',
          pedagogicalAlertKey: 'examsWithoutGrades',
        })
      }

      if (alerts.overdueActivities && alerts.overdueActivities.count > 0) {
        const { count } = alerts.overdueActivities
        collected.push({
          id: 'pedagogical:overdue-activities',
          severity: 'warn',
          category: 'pedagogical',
          title: `${count} atividade${count > 1 ? 's' : ''} vencida${count > 1 ? 's' : ''} sem notas`,
          subtitle: 'Atividades com prazo encerrado e correções pendentes',
          count,
          action: 'Ver',
          pedagogicalAlertKey: 'overdueActivities',
        })
      }

      if (alerts.ungradedSubmissions && alerts.ungradedSubmissions.count > 0) {
        const { count } = alerts.ungradedSubmissions
        collected.push({
          id: 'pedagogical:ungraded-submissions',
          severity: 'info',
          category: 'pedagogical',
          title: `${count} entrega${count > 1 ? 's' : ''} aguardando nota`,
          subtitle: 'Submissões de alunos sem avaliação',
          count,
          action: 'Ver',
          pedagogicalAlertKey: 'ungradedSubmissions',
        })
      }

      if (
        alerts.unacknowledgedAnnouncements &&
        alerts.unacknowledgedAnnouncements.announcementsCount > 0
      ) {
        const { count, announcementsCount, daysWindow } = alerts.unacknowledgedAnnouncements
        collected.push({
          id: 'pedagogical:unacknowledged-announcements',
          severity: 'warn',
          category: 'pedagogical',
          title: `${count} responsáve${count === 1 ? 'l' : 'is'} sem visualizar comunicado${announcementsCount > 1 ? 's' : ''}`,
          subtitle: `${announcementsCount} comunicado${announcementsCount > 1 ? 's' : ''} publicado${announcementsCount > 1 ? 's' : ''} nos últimos ${daysWindow} dias`,
          count,
          route: 'web.escola.comunicados',
          destinationLabel: 'comunicados',
          action: 'Cobrar',
          pedagogicalAlertKey: 'unacknowledgedAnnouncements',
        })
      }
    }

    const stats = escolaStatsQuery.data
    if (showFinancial && stats?.overdueAging && stats.overdueAging.totalCount > 0) {
      const ranges = stats.overdueAging.ranges
      const findRange = (label: string) => ranges.find((r) => r.label === label)
      const over61 = findRange('61+')?.count ?? 0
      const days3160 = findRange('31-60')?.count ?? 0
      const days030 = findRange('0-30')?.count ?? 0

      const totalCount = stats.overdueAging.totalCount
      const totalAmount = stats.overdueAging.totalAmountCents

      let severity: 'critical' | 'warn' | 'info'
      let subtitle: string
      if (over61 > 0) {
        severity = 'critical'
        subtitle = `${over61} fatura${over61 > 1 ? 's' : ''} há mais de 60 dias, risco de perda`
      } else if (days3160 > 0) {
        severity = 'warn'
        subtitle = `${days3160} fatura${days3160 > 1 ? 's' : ''} entre 31 e 60 dias de atraso`
      } else {
        severity = 'info'
        subtitle = `${days030} fatura${days030 > 1 ? 's' : ''} até 30 dias de atraso`
      }

      collected.push({
        id: 'financial:overdue',
        severity,
        category: 'financial',
        title: `${formatBRL(totalAmount)} em ${totalCount} fatura${totalCount > 1 ? 's' : ''} vencida${totalCount > 1 ? 's' : ''}`,
        subtitle,
        count: totalCount,
        route: 'web.escola.financeiro.inadimplencia',
        destinationLabel: 'inadimplência',
        action: 'Cobrar',
      })
    }

    const funnel = enrollmentFunnelQuery.data
    if (showEnrollment && funnel) {
      if (funnel.pendingDocuments > 0) {
        collected.push({
          id: 'enrollment:pending-documents',
          severity: 'warn',
          category: 'enrollment',
          title: `${funnel.pendingDocuments} matrícula${funnel.pendingDocuments > 1 ? 's' : ''} aguardando documentos`,
          subtitle: 'Documentação ainda não revisada pela secretaria',
          count: funnel.pendingDocuments,
          route: 'web.escola.administrativo.contratos',
          destinationLabel: 'contratos',
          action: 'Revisar',
        })
      }
    }

    collected.sort((a, b) => {
      const severityDiff = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity]
      if (severityDiff !== 0) return severityDiff
      return b.count - a.count
    })

    return collected
  }, [pedagogicalAlertsQuery.data, escolaStatsQuery.data, enrollmentFunnelQuery.data])

  const isLoading =
    pedagogicalAlertsQuery.isLoading ||
    enrollmentFunnelQuery.isLoading ||
    escolaStatsQuery.isLoading

  const isAllLoaded =
    !pedagogicalAlertsQuery.isLoading &&
    !enrollmentFunnelQuery.isLoading &&
    !escolaStatsQuery.isLoading

  return {
    items,
    isLoading,
    isAllLoaded,
    pedagogicalAlerts: pedagogicalAlertsQuery.data?.alerts as PedagogicalAlerts | undefined,
    overdueAging: escolaStatsQuery.data?.overdueAging,
    enrollmentFunnel: enrollmentFunnelQuery.data,
  }
}
