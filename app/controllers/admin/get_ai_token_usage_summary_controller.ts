import type { HttpContext } from '@adonisjs/core/http'
import vine from '@vinejs/vine'
import db from '@adonisjs/lucid/services/db'
import { DateTime } from 'luxon'

const queryValidator = vine.compile(
  vine.object({
    days: vine.number().min(1).max(365).optional(),
  })
)

type DailyRow = { day: string; inputTokens: number; outputTokens: number; totalTokens: number }
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

export default class GetAiTokenUsageSummaryController {
  async handle({ request, response }: HttpContext) {
    const { days = 30 } = await request.validateUsing(queryValidator)
    const since = DateTime.now().minus({ days }).toSQL()

    const [totals, byModel, byPurpose, bySchool, byUser, daily] = await Promise.all([
      this.totals(since),
      this.aggregateByColumn(since, 'model', 'model'),
      this.aggregateByColumn(since, 'purpose', 'purpose'),
      this.aggregateBySchool(since),
      this.aggregateByUser(since),
      this.daily(since),
    ])

    return response.ok({
      since,
      days,
      totals,
      byModel,
      byPurpose,
      bySchool,
      byUser,
      daily,
    })
  }

  private async totals(since: string) {
    const result = await db
      .from('ai_token_usages')
      .where('createdAt', '>=', since)
      .select(
        db.raw(`COALESCE(SUM("inputTokens"), 0)::bigint AS "inputTokens"`),
        db.raw(`COALESCE(SUM("outputTokens"), 0)::bigint AS "outputTokens"`),
        db.raw(`COALESCE(SUM("totalTokens"), 0)::bigint AS "totalTokens"`),
        db.raw('COUNT(*)::bigint AS count')
      )
      .first()

    return {
      inputTokens: Number(result?.inputTokens ?? 0),
      outputTokens: Number(result?.outputTokens ?? 0),
      totalTokens: Number(result?.totalTokens ?? 0),
      count: Number(result?.count ?? 0),
    }
  }

  private async aggregateByColumn(
    since: string,
    column: string,
    labelAlias: string
  ): Promise<GroupRow[]> {
    const rows = await db
      .from('ai_token_usages')
      .where('createdAt', '>=', since)
      .groupBy(column)
      .orderByRaw(`SUM("totalTokens") DESC`)
      .select(
        db.raw(`"${column}" AS key`),
        db.raw(`"${column}" AS "${labelAlias}"`),
        db.raw(`COALESCE(SUM("inputTokens"), 0)::bigint AS "inputTokens"`),
        db.raw(`COALESCE(SUM("outputTokens"), 0)::bigint AS "outputTokens"`),
        db.raw(`COALESCE(SUM("totalTokens"), 0)::bigint AS "totalTokens"`),
        db.raw('COUNT(*)::bigint AS count')
      )

    return rows.map((r) => ({
      key: String(r.key),
      label: String(r[labelAlias]),
      inputTokens: Number(r.inputTokens),
      outputTokens: Number(r.outputTokens),
      totalTokens: Number(r.totalTokens),
      count: Number(r.count),
    }))
  }

  private async aggregateBySchool(since: string): Promise<SchoolRow[]> {
    // Início do mês corrente em São Paulo. Usado pra calcular o "usado no mês"
    // contra o teto mensal da escola — independente da janela `days` que o
    // admin escolheu pra visualização.
    const monthStart = DateTime.now().setZone('America/Sao_Paulo').startOf('month').toSQL()
    const rows = await db
      .from('ai_token_usages AS atu')
      .leftJoin('School AS s', 's.id', 'atu.schoolId')
      .where('atu.createdAt', '>=', since)
      .groupBy('atu.schoolId', 's.name', 's.maxMonthlyChatTokens')
      .orderByRaw(`SUM("atu"."totalTokens") DESC`)
      .limit(20)
      .select(
        db.raw(`atu."schoolId" AS key`),
        db.raw(`COALESCE(s.name, '—') AS label`),
        db.raw(`COALESCE(SUM(atu."inputTokens"), 0)::bigint AS "inputTokens"`),
        db.raw(`COALESCE(SUM(atu."outputTokens"), 0)::bigint AS "outputTokens"`),
        db.raw(`COALESCE(SUM(atu."totalTokens"), 0)::bigint AS "totalTokens"`),
        db.raw('COUNT(*)::bigint AS count'),
        db.raw(
          `COALESCE(SUM(CASE WHEN atu."createdAt" >= ? THEN atu."totalTokens" ELSE 0 END), 0)::bigint AS "monthlyUsed"`,
          [monthStart]
        ),
        db.raw(`s."maxMonthlyChatTokens" AS "monthlyLimit"`)
      )

    return rows.map((r) => {
      const monthlyUsed = Number(r.monthlyUsed ?? 0)
      const rawLimit = r.monthlyLimit
      const monthlyLimit = rawLimit === null || rawLimit === undefined ? null : Number(rawLimit)
      let quotaStatus: SchoolRow['quotaStatus'] = 'unlimited'
      if (monthlyLimit !== null && monthlyLimit > 0) {
        if (monthlyUsed >= monthlyLimit) quotaStatus = 'exceeded'
        else if (monthlyUsed / monthlyLimit >= 0.8) quotaStatus = 'warning'
        else quotaStatus = 'ok'
      }
      return {
        key: r.key ?? 'sem-escola',
        label: String(r.label ?? '—'),
        inputTokens: Number(r.inputTokens),
        outputTokens: Number(r.outputTokens),
        totalTokens: Number(r.totalTokens),
        count: Number(r.count),
        monthlyUsed,
        monthlyLimit,
        quotaStatus,
      }
    })
  }

  private async aggregateByUser(since: string): Promise<GroupRow[]> {
    const rows = await db
      .from('ai_token_usages AS atu')
      .leftJoin('User AS u', 'u.id', 'atu.userId')
      .where('atu.createdAt', '>=', since)
      .groupBy('atu.userId', 'u.name')
      .orderByRaw(`SUM("atu"."totalTokens") DESC`)
      .limit(20)
      .select(
        db.raw(`atu."userId" AS key`),
        db.raw(`COALESCE(u.name, atu."userId") AS label`),
        db.raw(`COALESCE(SUM(atu."inputTokens"), 0)::bigint AS "inputTokens"`),
        db.raw(`COALESCE(SUM(atu."outputTokens"), 0)::bigint AS "outputTokens"`),
        db.raw(`COALESCE(SUM(atu."totalTokens"), 0)::bigint AS "totalTokens"`),
        db.raw('COUNT(*)::bigint AS count')
      )

    return rows.map((r) => ({
      key: String(r.key),
      label: String(r.label),
      inputTokens: Number(r.inputTokens),
      outputTokens: Number(r.outputTokens),
      totalTokens: Number(r.totalTokens),
      count: Number(r.count),
    }))
  }

  private async daily(since: string): Promise<DailyRow[]> {
    const rows = await db
      .from('ai_token_usages')
      .where('createdAt', '>=', since)
      .groupByRaw(`DATE("createdAt")`)
      .orderByRaw(`DATE("createdAt") ASC`)
      .select(
        db.raw(`DATE("createdAt")::text AS day`),
        db.raw(`COALESCE(SUM("inputTokens"), 0)::bigint AS "inputTokens"`),
        db.raw(`COALESCE(SUM("outputTokens"), 0)::bigint AS "outputTokens"`),
        db.raw(`COALESCE(SUM("totalTokens"), 0)::bigint AS "totalTokens"`)
      )

    return rows.map((r) => ({
      day: String(r.day),
      inputTokens: Number(r.inputTokens),
      outputTokens: Number(r.outputTokens),
      totalTokens: Number(r.totalTokens),
    }))
  }
}
