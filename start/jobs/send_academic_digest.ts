import mail from '@adonisjs/mail/services/main'
import logger from '@adonisjs/core/services/logger'
import env from '#start/env'
import { DateTime } from 'luxon'
import { v7 as uuidv7 } from 'uuid'

import Student from '#models/student'
import StudentHasResponsible from '#models/student_has_responsible'
import Notification from '#models/notification'
import Assignment from '#models/assignment'
import Exam from '#models/exam'
import Event from '#models/event'
import User from '#models/user'

const BR_TZ = 'America/Sao_Paulo'

export type DigestKind = 'daily' | 'weekly'

type DigestItemKind = 'exam' | 'assignment' | 'event'
type DigestItemBucket = 'tomorrow' | 'in-3-days'

interface DigestItem {
  kind: DigestItemKind
  bucket: DigestItemBucket
  title: string
  subject: string | null
  description: string | null
  dateIso: string // pra ordenação
  weekdayLabel: string // "QUI", "SEG" — uppercase, 3 chars
  dayLabel: string // "22 mai" — destaque
}

const IMPORTANT_EVENT_TYPES = [
  'PARENTS_MEETING',
  'FIELD_TRIP',
  'SPORTS_EVENT',
  'SCHOOL_PARTY',
  'ARTS_SHOW',
  'SCIENCE_FAIR',
] as const

function isImportantEvent(ev: Event): boolean {
  if (ev.requiresParentalConsent) return true
  if (ev.priority === 'HIGH' || ev.priority === 'URGENT') return true
  return (IMPORTANT_EVENT_TYPES as readonly string[]).includes(ev.type)
}

interface StudentBlock {
  studentId: string
  studentName: string
  items: DigestItem[]
}

type RecipientType = 'student' | 'responsible'

/**
 * Resolve a janela de busca em UTC pro tipo de digest. Daily = amanhã inteiro
 * (00:00 até 23:59:59 BR). Weekly = próximos 7 dias a partir de hoje (00:00 BR
 * até dia+7 23:59:59 BR). Trabalha em horário BR e converte pra UTC pq os
 * timestamps no banco são UTC.
 */
function resolveWindow(kind: DigestKind, now: DateTime) {
  const nowBr = now.setZone(BR_TZ)

  if (kind === 'daily') {
    const startBr = nowBr.plus({ days: 1 }).startOf('day')
    const endBr = startBr.endOf('day')
    return {
      start: startBr.toUTC(),
      end: endBr.toUTC(),
      bucket: startBr.toISODate()!, // YYYY-MM-DD
    }
  }

  const startBr = nowBr.startOf('day')
  const endBr = startBr.plus({ days: 6 }).endOf('day')
  return {
    start: startBr.toUTC(),
    end: endBr.toUTC(),
    bucket: startBr.toISO()!.slice(0, 10), // YYYY-MM-DD da segunda
  }
}

/**
 * Janela exata do 3º dia (D+3) usada como "Daqui a 3 dias" no daily digest.
 * Só pega eventos importantes (filtrados em loadStudentItems com eventsOnly=true).
 * Sem overlap com a janela "amanhã" (D+1) porque é um dia inteiro à parte.
 */
function resolveD3Window(now: DateTime) {
  const nowBr = now.setZone(BR_TZ)
  const startBr = nowBr.plus({ days: 3 }).startOf('day')
  const endBr = startBr.endOf('day')
  return {
    start: startBr.toUTC(),
    end: endBr.toUTC(),
  }
}

function formatDateLabels(d: DateTime): { weekdayLabel: string; dayLabel: string } {
  const inBr = d.setZone(BR_TZ).setLocale('pt-BR')
  return {
    weekdayLabel: inBr.toFormat('EEE').replace('.', '').toUpperCase(),
    dayLabel: inBr.toFormat("dd 'de' MMM").replace('.', ''),
  }
}

/**
 * Renderiza HTML do email. Layout table-based pra Outlook; sem flex/grid.
 * Identidade Anuá: violeta como accent ≤10%, neutros frios tintados de violeta,
 * borders 1px no lugar de sombras pesadas, tipografia carregando hierarquia.
 */

const ANUA_VIOLET = '#6d28d9'
const ANUA_VIOLET_SOFT = '#f5f3ff'
const TEXT_PRIMARY = '#1a1625' // tintado violeta, hue 285
const TEXT_MUTED = '#6b6577'
const BORDER_SOFT = '#e8e6ee'
const BG_PAGE = '#f7f6fa'

const ITEM_ACCENTS: Record<DigestItemKind, { stripe: string; label: string }> = {
  exam: { stripe: '#dc2626', label: 'Prova' },
  assignment: { stripe: '#d97706', label: 'Atividade' },
  event: { stripe: ANUA_VIOLET, label: 'Evento' },
}

const SECTION_TITLES: Record<DigestItemKind, string> = {
  exam: 'Provas',
  assignment: 'Atividades',
  event: 'Eventos',
}

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif"

function renderItemCard(item: DigestItem): string {
  const accent = ITEM_ACCENTS[item.kind]

  const subjectPill = item.subject
    ? `<span style="display:inline-block;background:${ANUA_VIOLET_SOFT};color:${ANUA_VIOLET};padding:3px 10px;border-radius:9999px;font-size:11px;font-weight:600;letter-spacing:0.2px;">${escapeHtml(item.subject)}</span>`
    : ''

  const descBlock = item.description
    ? `<div style="margin-top:12px;padding:12px 14px;background:#fbfafd;border:1px solid ${BORDER_SOFT};border-radius:8px;color:${TEXT_PRIMARY};font-size:14px;line-height:1.55;white-space:pre-wrap;">${escapeHtml(item.description)}</div>`
    : ''

  // Stripe colorido na esquerda como left-border (1 col table pra Outlook)
  return `
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom:12px;border:1px solid ${BORDER_SOFT};border-radius:12px;overflow:hidden;background:#ffffff;">
      <tr>
        <td width="4" style="width:4px;background:${accent.stripe};"></td>
        <td style="padding:18px 20px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
            <tr>
              <td style="vertical-align:top;padding-right:12px;">
                <div style="font-size:11px;font-weight:700;letter-spacing:1px;color:${accent.stripe};text-transform:uppercase;">${escapeHtml(accent.label)}</div>
                <div style="font-size:17px;font-weight:600;color:${TEXT_PRIMARY};line-height:1.3;margin-top:4px;">${escapeHtml(item.title)}</div>
              </td>
              <td align="right" style="vertical-align:top;white-space:nowrap;">
                <div style="font-size:11px;font-weight:700;letter-spacing:1.5px;color:${TEXT_MUTED};text-transform:uppercase;">${escapeHtml(item.weekdayLabel)}</div>
                <div style="font-size:14px;font-weight:600;color:${TEXT_PRIMARY};margin-top:2px;">${escapeHtml(item.dayLabel)}</div>
              </td>
            </tr>
          </table>
          ${subjectPill ? `<div style="margin-top:10px;">${subjectPill}</div>` : ''}
          ${descBlock}
        </td>
      </tr>
    </table>`
}

function renderSection(kind: DigestItemKind, items: DigestItem[]): string {
  if (items.length === 0) return ''
  const title = SECTION_TITLES[kind]
  return `
    <tr><td style="padding:24px 32px 12px 32px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
        <tr>
          <td style="font-size:12px;font-weight:700;letter-spacing:1.5px;color:${TEXT_MUTED};text-transform:uppercase;">${escapeHtml(title)}</td>
          <td align="right" style="font-size:12px;color:${TEXT_MUTED};">${items.length} ${items.length === 1 ? 'item' : 'itens'}</td>
        </tr>
      </table>
    </td></tr>
    <tr><td style="padding:0 32px;">${items.map(renderItemCard).join('')}</td></tr>`
}

function joinNamesPt(names: string[]): string {
  if (names.length === 0) return ''
  if (names.length === 1) return names[0]
  if (names.length === 2) return `${names[0]} e ${names[1]}`
  return `${names.slice(0, -1).join(', ')} e ${names[names.length - 1]}`
}

function renderBucketSections(items: DigestItem[]): string {
  const grouped: Record<DigestItemKind, DigestItem[]> = { exam: [], assignment: [], event: [] }
  for (const item of items) grouped[item.kind].push(item)
  return (['exam', 'assignment', 'event'] as DigestItemKind[])
    .map((k) => renderSection(k, grouped[k]))
    .join('')
}

function renderBucketHeader(label: string, sublabel: string): string {
  return `
    <tr><td style="padding:24px 32px 0 32px;">
      <div style="display:inline-block;font-size:10px;font-weight:700;letter-spacing:2px;color:${ANUA_VIOLET};text-transform:uppercase;background:${ANUA_VIOLET_SOFT};padding:4px 10px;border-radius:9999px;">${escapeHtml(label)}</div>
      <div style="margin-top:6px;font-size:13px;color:${TEXT_MUTED};">${escapeHtml(sublabel)}</div>
    </td></tr>`
}

function renderStudentBlock(block: StudentBlock, showHeader: boolean): string {
  const tomorrow = block.items.filter((i) => i.bucket === 'tomorrow')
  const d3 = block.items.filter((i) => i.bucket === 'in-3-days')

  const tomorrowHtml = tomorrow.length > 0 ? renderBucketSections(tomorrow) : ''
  const d3Html =
    d3.length > 0
      ? renderBucketHeader('Daqui a 3 dias', 'Eventos importantes que pedem preparo antecipado') +
        renderBucketSections(d3)
      : ''

  const headerHtml = showHeader
    ? `
      <tr><td style="padding:32px 32px 0 32px;">
        <div style="font-size:11px;font-weight:700;letter-spacing:2px;color:${ANUA_VIOLET};text-transform:uppercase;">Aluno</div>
        <div style="margin-top:4px;font-size:20px;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.3px;">${escapeHtml(block.studentName)}</div>
      </td></tr>`
    : ''

  return headerHtml + tomorrowHtml + d3Html
}

function renderFooterCopy(opts: { recipientType: RecipientType; studentNames: string[] }): string {
  if (opts.recipientType === 'student') {
    return `Você recebeu este email automático do <span style="color:${ANUA_VIOLET};font-weight:600;">Anuá</span> porque você é aluno.`
  }
  const names = joinNamesPt(opts.studentNames)
  return `Você recebeu este email automático do <span style="color:${ANUA_VIOLET};font-weight:600;">Anuá</span> porque você é responsável pedagógico de ${escapeHtml(names)}.`
}

function renderEmailHtml(opts: {
  kind: DigestKind
  students: StudentBlock[]
  recipientType: RecipientType
}): string {
  const { kind, students, recipientType } = opts

  const headline = kind === 'daily' ? 'Amanhã na escola' : 'Esta semana na escola'
  const studentNames = students.map((s) => s.studentName)
  const joinedNames = joinNamesPt(studentNames)
  const totalItems = students.reduce((acc, s) => acc + s.items.length, 0)

  const subline =
    kind === 'daily'
      ? `Veja o que ${joinedNames} ${students.length > 1 ? 'têm' : 'tem'} amanhã`
      : `Veja o que ${joinedNames} ${students.length > 1 ? 'têm' : 'tem'} nos próximos dias`

  const totalLabel = `${totalItems} ${totalItems === 1 ? 'item' : 'itens'}`
  const showStudentHeader = students.length > 1

  const studentsHtml = students.map((s) => renderStudentBlock(s, showStudentHeader)).join('')

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light">
  <meta name="supported-color-schemes" content="light">
  <title>${escapeHtml(headline)}</title>
</head>
<body style="margin:0;padding:0;background:${BG_PAGE};font-family:${FONT_STACK};color:${TEXT_PRIMARY};-webkit-font-smoothing:antialiased;">
  <div style="display:none;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;mso-hide:all;">
    ${escapeHtml(subline)} · ${escapeHtml(totalLabel)}
  </div>
  <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background:${BG_PAGE};">
    <tr><td align="center" style="padding:40px 16px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="max-width:600px;background:#ffffff;border:1px solid ${BORDER_SOFT};border-radius:16px;overflow:hidden;">

        <!-- Header -->
        <tr><td style="padding:32px 32px 0 32px;">
          <div style="display:inline-block;font-size:11px;font-weight:700;letter-spacing:2px;color:${ANUA_VIOLET};text-transform:uppercase;">Anuá</div>
          <h1 style="margin:12px 0 0 0;font-size:28px;line-height:1.2;font-weight:700;color:${TEXT_PRIMARY};letter-spacing:-0.5px;">${escapeHtml(headline)}</h1>
          <p style="margin:6px 0 0 0;font-size:15px;line-height:1.5;color:${TEXT_MUTED};">${escapeHtml(subline)} · <span style="color:${TEXT_PRIMARY};font-weight:500;">${escapeHtml(totalLabel)}</span></p>
        </td></tr>

        <!-- Divider -->
        <tr><td style="padding:24px 32px 0 32px;">
          <div style="height:1px;background:${BORDER_SOFT};font-size:0;line-height:0;">&nbsp;</div>
        </td></tr>

        ${studentsHtml}

        <!-- CTA -->
        <tr><td style="padding:8px 32px 32px 32px;">
          <table role="presentation" cellspacing="0" cellpadding="0" border="0">
            <tr><td style="border-radius:8px;background:${ANUA_VIOLET};">
              <a href="https://www.anuaapp.com.br/responsavel/calendario" style="display:inline-block;padding:12px 20px;font-size:14px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">Ver no calendário do app</a>
            </td></tr>
          </table>
        </td></tr>

        <!-- Footer -->
        <tr><td style="padding:20px 32px;background:#fbfafd;border-top:1px solid ${BORDER_SOFT};">
          <p style="margin:0;font-size:12px;line-height:1.55;color:${TEXT_MUTED};">
            ${renderFooterCopy({ recipientType, studentNames })}
          </p>
        </td></tr>

      </table>

      <!-- Outer footer / metadata -->
      <p style="margin:16px 0 0 0;font-size:11px;color:${TEXT_MUTED};font-family:${FONT_STACK};">
        Anuá · Sistema de gestão escolar
      </p>
    </td></tr>
  </table>
</body>
</html>`
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

interface ClassContext {
  classId: string
  schoolId: string
  levelId: string | null
  academicPeriodIds: string[]
}

/**
 * Carrega provas, atividades e eventos pra um aluno na janela. Eventos seguem
 * a mesma regra de audiência do calendar controller (SCHOOL/CLASS/
 * ACADEMIC_PERIOD/LEVEL) — por isso precisa do contexto completo da turma.
 *
 * `eventsOnly` (default false): quando true, ignora exams/assignments e
 * retorna só eventos importantes. Usado pra a seção "Daqui a 3 dias" do
 * daily digest, que polui menos focando em PARENTS_MEETING, FIELD_TRIP,
 * eventos com autorização parental, ou prioridade HIGH/URGENT.
 */
async function loadStudentItems(
  ctx: ClassContext,
  start: DateTime,
  end: DateTime,
  bucket: DigestItemBucket = 'tomorrow',
  eventsOnly: boolean = false
): Promise<DigestItem[]> {
  const startSql = start.toSQL()!
  const endSql = end.toSQL()!
  const { classId, schoolId, levelId, academicPeriodIds } = ctx

  const buildEventQuery = () =>
    Event.query()
      .where('schoolId', schoolId)
      .where('startDate', '>=', startSql)
      .where('startDate', '<=', endSql)
      .where('status', '!=', 'CANCELLED')
      .where((query) => {
        query.whereHas('eventAudiences', (audienceQuery) => {
          audienceQuery.where('scopeType', 'SCHOOL').where('scopeId', schoolId)
        })
        query.orWhereHas('eventAudiences', (audienceQuery) => {
          audienceQuery.where('scopeType', 'CLASS').where('scopeId', classId)
        })
        if (academicPeriodIds.length > 0) {
          query.orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery
              .where('scopeType', 'ACADEMIC_PERIOD')
              .whereIn('scopeId', academicPeriodIds)
          })
        }
        if (levelId) {
          query.orWhereHas('eventAudiences', (audienceQuery) => {
            audienceQuery.where('scopeType', 'LEVEL').where('scopeId', levelId)
          })
        }
      })
      .orderBy('startDate', 'asc')

  const [exams, assignments, events] = eventsOnly
    ? [[] as Exam[], [] as Assignment[], await buildEventQuery()]
    : await Promise.all([
        Exam.query()
          .where('classId', classId)
          .where('examDate', '>=', startSql)
          .where('examDate', '<=', endSql)
          .where('status', '!=', 'CANCELLED')
          .preload('subject')
          .orderBy('examDate', 'asc'),
        Assignment.query()
          .whereHas('teacherHasClass', (q) => q.where('classId', classId))
          .where('dueDate', '>=', startSql)
          .where('dueDate', '<=', endSql)
          .preload('teacherHasClass', (q) => q.preload('subject'))
          .orderBy('dueDate', 'asc'),
        buildEventQuery(),
      ])

  const items: DigestItem[] = []

  for (const exam of exams) {
    items.push({
      kind: 'exam',
      bucket,
      title: exam.title,
      subject: exam.subject?.name ?? null,
      description: exam.description,
      dateIso: exam.examDate.toISO()!,
      ...formatDateLabels(exam.examDate),
    })
  }

  for (const a of assignments) {
    items.push({
      kind: 'assignment',
      bucket,
      title: a.name,
      subject: a.teacherHasClass?.subject?.name ?? null,
      description: a.description,
      dateIso: a.dueDate.toISO()!,
      ...formatDateLabels(a.dueDate),
    })
  }

  for (const ev of events) {
    if (eventsOnly && !isImportantEvent(ev)) continue
    items.push({
      kind: 'event',
      bucket,
      title: ev.title,
      subject: ev.shortDescription,
      description: ev.description,
      dateIso: ev.startDate.toISO()!,
      ...formatDateLabels(ev.startDate),
    })
  }

  items.sort((x, y) => x.dateIso.localeCompare(y.dateIso))
  return items
}

/**
 * Resolve destinatários (email) pra um aluno: responsáveis com isPedagogical=true
 * + o próprio aluno se isSelfResponsible=true. Filtra quem não tem email.
 */
async function loadRecipients(
  studentId: string,
  studentIsSelfResponsible: boolean
): Promise<Array<{ userId: string; email: string; name: string }>> {
  const links = await StudentHasResponsible.query()
    .where('studentId', studentId)
    .where('isPedagogical', true)
    .preload('responsible')

  const recipients: Array<{ userId: string; email: string; name: string }> = []
  const seen = new Set<string>()

  for (const link of links) {
    const u = link.responsible
    if (!u || !u.email || seen.has(u.id)) continue
    seen.add(u.id)
    recipients.push({ userId: u.id, email: u.email, name: u.name })
  }

  if (studentIsSelfResponsible) {
    const selfUser = await User.find(studentId)
    if (selfUser?.email && !seen.has(selfUser.id)) {
      seen.add(selfUser.id)
      recipients.push({ userId: selfUser.id, email: selfUser.email, name: selfUser.name })
    }
  }

  return recipients
}

interface DigestPayload {
  kind: DigestKind
  // dryRun pula o envio real de email e o marker — útil pra teste manual
  dryRun?: boolean
}

function buildSubject(kind: DigestKind, studentNames: string[]): string {
  const joined = joinNamesPt(studentNames)
  return kind === 'daily' ? `Amanhã na escola: ${joined}` : `Esta semana na escola: ${joined}`
}

/**
 * Renderiza (sem enviar) o digest pra um ou mais alunos, simulando o
 * destinatário como responsável (ou aluno, com 1 só). Usado pelo command de
 * preview pra mandar pra um único email-alvo sem disparar pros responsáveis
 * reais. Retorna null se nenhum dos alunos tem itens na janela.
 */
export async function buildDigestPreview(opts: {
  kind: DigestKind
  studentIds: string[]
  recipientType?: RecipientType
}): Promise<{
  subject: string
  html: string
  itemsCount: number
  studentNames: string[]
} | null> {
  const { kind, studentIds, recipientType = 'responsible' } = opts
  if (studentIds.length === 0) return null

  const { start, end } = resolveWindow(kind, DateTime.now())
  const blocks: StudentBlock[] = []

  for (const studentId of studentIds) {
    const student = await Student.query()
      .where('id', studentId)
      .preload('user')
      .preload('class', (q) => q.preload('academicPeriods'))
      .first()

    if (!student || !student.classId || !student.class) continue

    const ctx: ClassContext = {
      classId: student.classId,
      schoolId: student.class.schoolId,
      levelId: student.class.levelId ?? null,
      academicPeriodIds: student.class.academicPeriods.map((p) => p.id),
    }

    const items = await loadStudentItems(ctx, start, end)
    if (items.length === 0) continue

    blocks.push({
      studentId: student.id,
      studentName: student.user?.name ?? 'aluno',
      items,
    })
  }

  if (blocks.length === 0) return null

  const studentNames = blocks.map((b) => b.studentName)
  const subject = buildSubject(kind, studentNames)
  const html = renderEmailHtml({ kind, students: blocks, recipientType })
  const itemsCount = blocks.reduce((acc, b) => acc + b.items.length, 0)

  return { subject, html, itemsCount, studentNames }
}

interface DigestStats {
  studentsProcessed: number
  studentsWithoutItems: number
  recipientsConsidered: number
  emailsSent: number
  emailsSkippedAlreadySent: number
  emailsFailed: number
}

interface AggregatedRecipient {
  userId: string
  email: string
  type: RecipientType
  students: StudentBlock[]
}

/**
 * Agrupa provas + atividades + eventos por destinatário (não por aluno):
 * responsável com 2+ filhos recebe 1 email único cobrindo todos. Alunos
 * autorresponsáveis recebem o seu próprio. Idempotência via Notification
 * marker: 1 email por (userId, kind, bucket).
 */
export async function sendAcademicDigest(payload: DigestPayload): Promise<DigestStats> {
  const { kind, dryRun = false } = payload
  const stats: DigestStats = {
    studentsProcessed: 0,
    studentsWithoutItems: 0,
    recipientsConsidered: 0,
    emailsSent: 0,
    emailsSkippedAlreadySent: 0,
    emailsFailed: 0,
  }

  const now = DateTime.now()
  const { start, end, bucket } = resolveWindow(kind, now)
  const markerType = kind === 'daily' ? 'ACADEMIC_DIGEST_DAILY' : 'ACADEMIC_DIGEST_WEEKLY'

  // Só no daily: incluir seção "Daqui a 3 dias" com eventos importantes (PARENTS_MEETING,
  // FIELD_TRIP, etc). Dá antecedência maior pro responsável organizar.
  const d3Window = kind === 'daily' ? resolveD3Window(now) : null

  // 1ª passada: pra cada aluno com classId, calcula items + lista destinatários.
  // Não filtrar por enrollmentStatus — handler confia em StudentHasResponsible.
  const students = await Student.query()
    .whereNotNull('classId')
    .preload('user')
    .preload('class', (q) => q.preload('academicPeriods'))

  // Acumula por userId → quais (block, type)
  const byRecipient = new Map<string, AggregatedRecipient>()

  for (const student of students) {
    stats.studentsProcessed++
    if (!student.classId || !student.class) continue

    const ctx: ClassContext = {
      classId: student.classId,
      schoolId: student.class.schoolId,
      levelId: student.class.levelId ?? null,
      academicPeriodIds: student.class.academicPeriods.map((p) => p.id),
    }

    const tomorrowItems = await loadStudentItems(ctx, start, end, 'tomorrow')
    const d3Items = d3Window
      ? await loadStudentItems(ctx, d3Window.start, d3Window.end, 'in-3-days', true)
      : []
    const items = [...tomorrowItems, ...d3Items]

    if (items.length === 0) {
      stats.studentsWithoutItems++
      continue
    }

    const recipients = await loadRecipients(student.id, student.isSelfResponsible)
    if (recipients.length === 0) continue

    const studentName = student.user?.name ?? 'aluno'
    const block: StudentBlock = { studentId: student.id, studentName, items }

    for (const recipient of recipients) {
      const existing = byRecipient.get(recipient.userId)
      // Tipo do destinatário: 'student' se o userId bate com o studentId
      // (autorresponsável); caso contrário, 'responsible'. Se o mesmo userId
      // aparece em dois alunos diferentes, mantemos o primeiro — o caso de um
      // userId ser self pra um aluno e responsável pra outro é tão raro que
      // não vale lógica extra; aluno autorresponsável tipicamente não é
      // responsável de outro.
      const isSelf = recipient.userId === student.id
      if (existing) {
        existing.students.push(block)
      } else {
        byRecipient.set(recipient.userId, {
          userId: recipient.userId,
          email: recipient.email,
          type: isSelf ? 'student' : 'responsible',
          students: [block],
        })
      }
    }
  }

  stats.recipientsConsidered = byRecipient.size

  // 2ª passada: pra cada destinatário, anti-flood + render + envio.
  for (const recipient of byRecipient.values()) {
    const already = await Notification.query()
      .where('userId', recipient.userId)
      .where('type', markerType)
      .whereRaw(`data->>'bucket' = ?`, [bucket])
      .first()

    if (already) {
      stats.emailsSkippedAlreadySent++
      continue
    }

    const studentNames = recipient.students.map((s) => s.studentName)
    const subject = buildSubject(kind, studentNames)
    const totalItems = recipient.students.reduce((acc, s) => acc + s.items.length, 0)

    if (dryRun) {
      logger.info(
        {
          kind,
          bucket,
          userId: recipient.userId,
          email: recipient.email,
          type: recipient.type,
          studentCount: recipient.students.length,
          totalItems,
        },
        '[academic-digest] dry-run'
      )
      stats.emailsSent++
      continue
    }

    try {
      const html = renderEmailHtml({
        kind,
        students: recipient.students,
        recipientType: recipient.type,
      })
      await mail.send((message) => {
        message.from(env.get('SMTP_FROM_EMAIL')).to(recipient.email).subject(subject).html(html)
      })

      await Notification.create({
        id: uuidv7(),
        userId: recipient.userId,
        type: markerType,
        title: subject,
        message: `${totalItems} ${totalItems === 1 ? 'item' : 'itens'} no ${kind === 'daily' ? 'dia' : 'semana'}`,
        data: {
          bucket,
          itemCount: totalItems,
          studentIds: recipient.students.map((s) => s.studentId),
        },
        isRead: true, // marker — não polui sino in-app
        sentViaInApp: false,
        sentViaEmail: true,
        sentViaWhatsApp: false,
        sentViaPush: false,
        sentViaSms: false,
        emailSentAt: DateTime.now(),
        actionUrl: '/responsavel/calendario',
      })

      stats.emailsSent++
    } catch (err) {
      stats.emailsFailed++
      logger.error(
        { err, userId: recipient.userId, email: recipient.email, kind },
        '[academic-digest] falha ao enviar email'
      )
    }
  }

  logger.info({ kind, ...stats }, '[academic-digest] done')
  return stats
}
