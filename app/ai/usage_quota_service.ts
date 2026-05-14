import { DateTime } from 'luxon'
import AiTokenUsage from '#models/ai_token_usage'
import School from '#models/school'

export type QuotaStatus = 'unlimited' | 'ok' | 'warning' | 'exceeded'

export type QuotaSnapshot = {
  schoolId: string
  monthStart: string
  used: number
  limit: number | null
  percent: number | null
  status: QuotaStatus
}

// Threshold em que /admin/ai/tokens passa a destacar a escola em "warning".
// Bate com o que estava listado nas considerações do roadmap (item 3).
const WARNING_THRESHOLD = 0.8

function currentMonthStart(): DateTime {
  return DateTime.now().setZone('America/Sao_Paulo').startOf('month')
}

async function usedThisMonth(schoolId: string, monthStart: DateTime): Promise<number> {
  const row = await AiTokenUsage.query()
    .where('schoolId', schoolId)
    .where('createdAt', '>=', monthStart.toISO()!)
    .sum('totalTokens as total')
    .first()
  // sum() em Lucid devolve string|null no PG; converte e cai pra 0 quando
  // não tem nenhuma linha no mês ainda.
  const raw = row?.$extras.total
  if (raw === null || raw === undefined) return 0
  const parsed = typeof raw === 'string' ? Number.parseInt(raw, 10) : Number(raw)
  return Number.isFinite(parsed) ? parsed : 0
}

function statusFor(used: number, limit: number | null): QuotaStatus {
  if (limit === null) return 'unlimited'
  if (limit <= 0) return 'unlimited'
  if (used >= limit) return 'exceeded'
  if (used / limit >= WARNING_THRESHOLD) return 'warning'
  return 'ok'
}

export async function getQuotaSnapshot(schoolId: string): Promise<QuotaSnapshot> {
  const monthStart = currentMonthStart()
  const [school, used] = await Promise.all([
    School.find(schoolId),
    usedThisMonth(schoolId, monthStart),
  ])
  const limit = school?.maxMonthlyChatTokens ?? null
  const status = statusFor(used, limit)
  return {
    schoolId,
    monthStart: monthStart.toISO()!,
    used,
    limit,
    percent: limit !== null && limit > 0 ? used / limit : null,
    status,
  }
}

/**
 * Gate síncrono antes de chamar o LLM. Retorna `null` quando pode prosseguir
 * (inclui o caso de quota ilimitada — default). Quando estourou, devolve
 * mensagem polida pra mandar de volta pro usuário.
 *
 * Não bloqueia em warning: 80% é só sinalização visual no admin, não corta o
 * uso. Quem opera decide se eleva ou avisa a escola.
 */
export async function checkQuotaOrDeny(
  schoolId: string | null
): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  if (!schoolId) return { allowed: true }
  const snap = await getQuotaSnapshot(schoolId)
  if (snap.status === 'exceeded') {
    return {
      allowed: false,
      reason:
        'A escola atingiu o limite mensal de uso do assistente. Fale com o administrador para liberar mais ou aguarde o próximo mês.',
    }
  }
  return { allowed: true }
}

export async function getQuotaSnapshotsForSchools(
  schoolIds: string[]
): Promise<Map<string, QuotaSnapshot>> {
  const snaps = await Promise.all(schoolIds.map((id) => getQuotaSnapshot(id)))
  return new Map(snaps.map((s) => [s.schoolId, s]))
}
