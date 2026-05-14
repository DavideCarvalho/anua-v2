import { z } from 'zod'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'
import { defineTool } from '../tool.js'
import { toolRegistry, type ToolContext } from '../tool_registry.js'

// Métricas onde "subir é ruim" — usado pra inverter o sentido de `isImprovement`.
const HIGHER_IS_WORSE = new Set(['overdue_payments', 'absences'])

// Toda métrica tem uma das duas semânticas:
//
// - 'snapshot'  → reconstrói o estado em um instante específico (asOf).
//                 Pergunta: "como estava em X?". Exemplo: inadimplência,
//                 matrículas ativas.
// - 'window'    → conta eventos em uma janela [start, end). Pergunta: "quantos
//                 aconteceram entre A e B?". Exemplo: faltas registradas,
//                 comunicados enviados.
//
// O comparativo é sempre "agora vs período anterior de mesma duração".
type Semantics = 'snapshot' | 'window'

const METRIC_DEFS = {
  overdue_payments: {
    semantics: 'snapshot' as Semantics,
    unit: 'boletos',
    label: 'Boletos vencidos',
  },
  active_enrollments: {
    semantics: 'snapshot' as Semantics,
    unit: 'alunos',
    label: 'Alunos matriculados',
  },
  absences: {
    semantics: 'window' as Semantics,
    unit: 'faltas',
    label: 'Faltas registradas',
  },
  announcements_sent: {
    semantics: 'window' as Semantics,
    unit: 'comunicados',
    label: 'Comunicados publicados',
  },
}

type Metric = keyof typeof METRIC_DEFS

type Point = {
  asOf: string
  value: number
  // Para overdue_payments também devolvemos o valor monetário em centavos.
  secondaryValue?: number
  secondaryUnit?: string
}

type BreakdownItem = {
  id: string
  label: string
  now: number
  then: number
  delta: number
  deltaPct: number | null
}

type Result = {
  metric: Metric
  label: string
  semantics: Semantics
  unit: string
  period: string
  now: Point
  then: Point
  delta: number
  deltaPct: number | null
  direction: 'up' | 'down' | 'flat'
  isImprovement: boolean
  breakdown?: {
    by: 'class'
    items: BreakdownItem[]
  }
}

function periodToDays(period: '7d' | '30d' | '90d' | '12m'): number {
  if (period === '7d') return 7
  if (period === '30d') return 30
  if (period === '90d') return 90
  return 365
}

async function overdueAsOf(schoolId: string, asOf: string): Promise<Point> {
  const { rows } = await db.rawQuery<{
    rows: [{ n: string; amount: string | null }]
  }>(
    `
      SELECT COUNT(*)::bigint AS n,
             COALESCE(SUM(sp."totalAmount"), 0)::bigint AS amount
      FROM "StudentPayment" sp
      JOIN "Student" s ON s.id = sp."studentId"
      JOIN "User" u ON u.id = s.id
      WHERE u."schoolId" = :schoolId
        AND u."deletedAt" IS NULL
        AND sp."dueDate" < :asOf::date
        AND (sp."paidAt" IS NULL OR sp."paidAt" > :asOf::date)
        AND sp.status <> 'CANCELLED'
    `,
    { schoolId, asOf }
  )
  const row = rows[0]
  return {
    asOf,
    value: Number(row?.n ?? 0),
    secondaryValue: Number(row?.amount ?? 0),
    secondaryUnit: 'centavos',
  }
}

async function activeEnrollmentsAsOf(schoolId: string, asOf: string): Promise<Point> {
  // DISTINCT studentId: um aluno pode ter mais de um StudentHasLevel ao longo
  // do tempo (períodos diferentes), mas "matriculado em X" é binário por aluno.
  const { rows } = await db.rawQuery<{ rows: [{ n: string }] }>(
    `
      SELECT COUNT(DISTINCT shl."studentId")::bigint AS n
      FROM "StudentHasLevel" shl
      JOIN "Class" c ON c.id = shl."classId"
      WHERE c."schoolId" = :schoolId
        AND shl."createdAt" <= :asOf::timestamptz
        AND (shl."deletedAt" IS NULL OR shl."deletedAt" > :asOf::timestamptz)
    `,
    { schoolId, asOf }
  )
  return { asOf, value: Number(rows[0]?.n ?? 0) }
}

async function absencesInWindow(
  schoolId: string,
  start: string,
  end: string
): Promise<Point> {
  const { rows } = await db.rawQuery<{ rows: [{ n: string }] }>(
    `
      SELECT COUNT(*)::bigint AS n
      FROM "StudentHasAttendance" sha
      JOIN "Attendance" a ON a.id = sha."attendanceId"
      JOIN "Student" s ON s.id = sha."studentId"
      JOIN "User" u ON u.id = s.id
      WHERE u."schoolId" = :schoolId
        AND u."deletedAt" IS NULL
        AND sha.status = 'ABSENT'
        AND a.date >= :start::date
        AND a.date < :end::date
    `,
    { schoolId, start, end }
  )
  return { asOf: end, value: Number(rows[0]?.n ?? 0) }
}

type BreakdownRow = { id: string; label: string; now: string; then: string }

function toBreakdown(rows: BreakdownRow[], topN: number): BreakdownItem[] {
  return rows
    .map((r) => {
      const now = Number(r.now ?? 0)
      const then = Number(r.then ?? 0)
      const delta = now - then
      const deltaPct = then > 0 ? (delta / then) * 100 : null
      return { id: r.id, label: r.label, now, then, delta, deltaPct }
    })
    .sort((a, b) => Math.abs(b.delta) - Math.abs(a.delta))
    .slice(0, topN)
}

async function overdueByClass(
  schoolId: string,
  nowDate: string,
  thenDate: string,
  topN: number
): Promise<BreakdownItem[]> {
  const { rows } = await db.rawQuery<{ rows: BreakdownRow[] }>(
    `
      SELECT COALESCE(s."classId"::text, '__unassigned__') AS id,
             COALESCE(c.name, '— sem turma —') AS label,
             SUM(CASE WHEN sp."dueDate" < :nowDate::date
                        AND (sp."paidAt" IS NULL OR sp."paidAt" > :nowDate::date)
                      THEN 1 ELSE 0 END)::bigint AS now,
             SUM(CASE WHEN sp."dueDate" < :thenDate::date
                        AND (sp."paidAt" IS NULL OR sp."paidAt" > :thenDate::date)
                      THEN 1 ELSE 0 END)::bigint AS then
      FROM "StudentPayment" sp
      JOIN "Student" s ON s.id = sp."studentId"
      JOIN "User" u ON u.id = s.id
      LEFT JOIN "Class" c ON c.id = s."classId"
      WHERE u."schoolId" = :schoolId
        AND u."deletedAt" IS NULL
        AND sp.status <> 'CANCELLED'
      GROUP BY s."classId", c.name
    `,
    { schoolId, nowDate, thenDate }
  )
  return toBreakdown(rows, topN)
}

async function enrollmentsByClass(
  schoolId: string,
  nowDate: string,
  thenDate: string,
  topN: number
): Promise<BreakdownItem[]> {
  const { rows } = await db.rawQuery<{ rows: BreakdownRow[] }>(
    `
      SELECT shl."classId"::text AS id,
             c.name AS label,
             COUNT(DISTINCT CASE WHEN shl."createdAt" <= :nowDate::timestamptz
                                  AND (shl."deletedAt" IS NULL OR shl."deletedAt" > :nowDate::timestamptz)
                                 THEN shl."studentId" END)::bigint AS now,
             COUNT(DISTINCT CASE WHEN shl."createdAt" <= :thenDate::timestamptz
                                  AND (shl."deletedAt" IS NULL OR shl."deletedAt" > :thenDate::timestamptz)
                                 THEN shl."studentId" END)::bigint AS then
      FROM "StudentHasLevel" shl
      JOIN "Class" c ON c.id = shl."classId"
      WHERE c."schoolId" = :schoolId
      GROUP BY shl."classId", c.name
    `,
    { schoolId, nowDate, thenDate }
  )
  return toBreakdown(rows, topN)
}

async function absencesByClass(
  schoolId: string,
  nowStart: string,
  nowEnd: string,
  thenStart: string,
  thenEnd: string,
  topN: number
): Promise<BreakdownItem[]> {
  const { rows } = await db.rawQuery<{ rows: BreakdownRow[] }>(
    `
      SELECT COALESCE(s."classId"::text, '__unassigned__') AS id,
             COALESCE(c.name, '— sem turma —') AS label,
             SUM(CASE WHEN a.date >= :nowStart::date AND a.date < :nowEnd::date
                      THEN 1 ELSE 0 END)::bigint AS now,
             SUM(CASE WHEN a.date >= :thenStart::date AND a.date < :thenEnd::date
                      THEN 1 ELSE 0 END)::bigint AS then
      FROM "StudentHasAttendance" sha
      JOIN "Attendance" a ON a.id = sha."attendanceId"
      JOIN "Student" s ON s.id = sha."studentId"
      JOIN "User" u ON u.id = s.id
      LEFT JOIN "Class" c ON c.id = s."classId"
      WHERE u."schoolId" = :schoolId
        AND u."deletedAt" IS NULL
        AND sha.status = 'ABSENT'
        AND (
          (a.date >= :nowStart::date  AND a.date < :nowEnd::date) OR
          (a.date >= :thenStart::date AND a.date < :thenEnd::date)
        )
      GROUP BY s."classId", c.name
    `,
    { schoolId, nowStart, nowEnd, thenStart, thenEnd }
  )
  return toBreakdown(rows, topN)
}

async function announcementsInWindow(
  schoolId: string,
  start: string,
  end: string
): Promise<Point> {
  const { rows } = await db.rawQuery<{ rows: [{ n: string }] }>(
    `
      SELECT COUNT(*)::bigint AS n
      FROM "SchoolAnnouncement"
      WHERE "schoolId" = :schoolId
        AND status = 'PUBLISHED'
        AND "publishedAt" >= :start::timestamptz
        AND "publishedAt" < :end::timestamptz
    `,
    { schoolId, start, end }
  )
  return { asOf: end, value: Number(rows[0]?.n ?? 0) }
}

function compare(metric: Metric, now: Point, then: Point, period: string): Result {
  const def = METRIC_DEFS[metric]
  const delta = now.value - then.value
  const deltaPct = then.value > 0 ? (delta / then.value) * 100 : null
  let direction: Result['direction'] = 'flat'
  if (delta > 0) direction = 'up'
  else if (delta < 0) direction = 'down'

  // overdue/absences subindo é ruim; o resto, subir é bom.
  const higherIsWorse = HIGHER_IS_WORSE.has(metric)
  const isImprovement =
    direction === 'flat'
      ? true
      : higherIsWorse
        ? direction === 'down'
        : direction === 'up'

  return {
    metric,
    label: def.label,
    semantics: def.semantics,
    unit: def.unit,
    period,
    now,
    then,
    delta,
    deltaPct,
    direction,
    isImprovement,
  }
}

const DESCRIPTION = `Compara um indicador da escola entre o momento atual e um período atrás (7d, 30d, 90d ou 12 meses). Sem snapshot table — reconstrói o passado direto dos dados-evento (dueDate/paidAt pra boletos, createdAt/deletedAt pra matrículas, date pra faltas, publishedAt pra comunicados).

Parâmetros:
- metric: 'overdue_payments' (boletos vencidos), 'active_enrollments' (alunos matriculados), 'absences' (faltas), 'announcements_sent' (comunicados publicados).
- period: '7d' | '30d' | '90d' | '12m'. Default 30d.
- breakdownBy: 'class' opcional. Quando setado, devolve também os top 5 contribuintes (turmas com maior variação absoluta). Não suportado pra announcements_sent (comunicados são school-wide). Default null.

Semântica:
- overdue_payments e active_enrollments são SNAPSHOT: compara "como está hoje" vs "como estava em (hoje - period)".
- absences e announcements_sent são WINDOW: compara "[hoje-period, hoje]" vs "[hoje-2*period, hoje-period]".

Retorna { metric, label, semantics, unit, period, now, then, delta, deltaPct, direction, isImprovement, breakdown?: { by: 'class', items: [{ id, label, now, then, delta, deltaPct }] } }.

deltaPct é null quando then.value=0. isImprovement já considera a direção certa: overdue/absences subir é ruim, matrículas/comunicados subir é bom.

Pra exibir, prefira renderResult com componente Comparison. O Comparison já consome o breakdown e mostra os top contribuintes embaixo do número — passe o breakdown como-é. Use breakdownBy='class' quando o usuário perguntar "subiu por quê" ou "qual turma puxou" — caso contrário, omita pra economizar token.`

export function createGetHistoricalComparison(ctx: ToolContext) {
  return defineTool({
    name: 'getHistoricalComparison',
    description: DESCRIPTION,
    parameters: z.object({
      metric: z.enum([
        'overdue_payments',
        'active_enrollments',
        'absences',
        'announcements_sent',
      ]),
      period: z.enum(['7d', '30d', '90d', '12m']).default('30d'),
      breakdownBy: z
        .enum(['class'])
        .nullable()
        .optional()
        .describe('Top 5 turmas com maior variação. Não suportado pra announcements_sent.'),
    }),
    execute: async ({
      metric,
      period,
      breakdownBy,
    }: {
      metric: Metric
      period: '7d' | '30d' | '90d' | '12m'
      breakdownBy?: 'class' | null
    }) => {
      const days = periodToDays(period)
      const today = DateTime.now().setZone('America/Sao_Paulo').startOf('day')
      const previous = today.minus({ days })
      const todayIso = today.toISODate()!
      const previousIso = previous.toISODate()!

      const def = METRIC_DEFS[metric]
      const wantsBreakdown = breakdownBy === 'class' && metric !== 'announcements_sent'

      if (def.semantics === 'snapshot') {
        const [now, then, breakdown] =
          metric === 'overdue_payments'
            ? await Promise.all([
                overdueAsOf(ctx.schoolId, todayIso),
                overdueAsOf(ctx.schoolId, previousIso),
                wantsBreakdown
                  ? overdueByClass(ctx.schoolId, todayIso, previousIso, 5)
                  : Promise.resolve(null),
              ])
            : await Promise.all([
                activeEnrollmentsAsOf(ctx.schoolId, todayIso),
                activeEnrollmentsAsOf(ctx.schoolId, previousIso),
                wantsBreakdown
                  ? enrollmentsByClass(ctx.schoolId, todayIso, previousIso, 5)
                  : Promise.resolve(null),
              ])
        const result = compare(metric, now, then, period)
        return breakdown ? { ...result, breakdown: { by: 'class' as const, items: breakdown } } : result
      }

      // Window: [previous, today] vs [previous-period, previous]
      const previousPreviousIso = previous.minus({ days }).toISODate()!
      const [now, then, breakdown] =
        metric === 'absences'
          ? await Promise.all([
              absencesInWindow(ctx.schoolId, previousIso, todayIso),
              absencesInWindow(ctx.schoolId, previousPreviousIso, previousIso),
              wantsBreakdown
                ? absencesByClass(
                    ctx.schoolId,
                    previousIso,
                    todayIso,
                    previousPreviousIso,
                    previousIso,
                    5
                  )
                : Promise.resolve(null),
            ])
          : await Promise.all([
              announcementsInWindow(ctx.schoolId, previousIso, todayIso),
              announcementsInWindow(ctx.schoolId, previousPreviousIso, previousIso),
              Promise.resolve(null),
            ])
      const result = compare(metric, now, then, period)
      return breakdown ? { ...result, breakdown: { by: 'class' as const, items: breakdown } } : result
    },
  })
}

toolRegistry.register('gestor', createGetHistoricalComparison)
