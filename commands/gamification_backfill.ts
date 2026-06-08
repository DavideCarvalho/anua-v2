import { BaseCommand, flags } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import db from '@adonisjs/lucid/services/db'
import GamificationEvent from '#models/gamification_event'
import { gamificationEventService } from '#services/gamification/gamification_event_service'

export default class GamificationBackfill extends BaseCommand {
  static commandName = 'gamification:backfill'
  static description =
    'Backfill de eventos de gamificação a partir do último evento processado por tipo'

  static options: CommandOptions = {
    startApp: true,
  }

  @flags.boolean({ description: 'Mostra quantos seriam processados sem disparar', alias: 'd' })
  declare dryRun: boolean

  @flags.string({ description: 'Data mínima (YYYY-MM-DD)', alias: 's' })
  declare since: string | undefined

  async run() {
    const sinceDate = this.since ?? '2026-01-01'

    const attendanceStats = await this.backfillAttendance(sinceDate)
    const assignmentGradeStats = await this.backfillAssignmentGrades(sinceDate)
    const examGradeStats = await this.backfillExamGrades(sinceDate)

    this.logger.info('--- Resumo ---')
    this.logger.info(`Presenças/Atrasos: ${attendanceStats}`)
    this.logger.info(`Notas de atividades: ${assignmentGradeStats}`)
    this.logger.info(`Notas de provas: ${examGradeStats}`)

    if (this.dryRun) {
      this.logger.info('(dry-run — nenhum evento foi criado)')
    }
  }

  private async getLastEventDate(entityType: string): Promise<string | null> {
    const last = await GamificationEvent.query()
      .where('entityType', entityType)
      .orderBy('createdAt', 'desc')
      .first()

    return last?.createdAt?.toISO() ?? null
  }

  private async backfillAttendance(sinceDate: string): Promise<number> {
    const lastDate = await this.getLastEventDate('Attendance')
    const cutoff = lastDate ?? sinceDate

    const rows = await db.rawQuery<{
      rows: Array<{
        id: string
        studentId: string
        status: string
        date: string
        attendanceId: string
      }>
    }>(
      `
      SELECT sha.id, sha."studentId", sha.status,
             a.date::text as date, sha."attendanceId"
      FROM "StudentHasAttendance" sha
      JOIN "Attendance" a ON a.id = sha."attendanceId"
      WHERE sha.status IN ('PRESENT', 'LATE')
        AND sha."createdAt" > ?
      ORDER BY sha."createdAt" ASC
    `,
      [cutoff]
    )

    const records = rows.rows
    this.logger.info(`Attendance: ${records.length} registros encontrados (desde ${cutoff})`)

    if (this.dryRun) return records.length

    let count = 0
    for (const row of records) {
      await gamificationEventService.emitAttendanceMarked({
        attendanceId: row.attendanceId,
        studentId: row.studentId,
        status: row.status as 'PRESENT' | 'LATE',
        date: row.date,
      })
      count++
      if (count % 100 === 0) {
        this.logger.info(`  Attendance: ${count}/${records.length} processados`)
      }
    }

    return count
  }

  private async backfillAssignmentGrades(sinceDate: string): Promise<number> {
    const lastDate = await this.getLastEventDate('Assignment')
    const cutoff = lastDate ?? sinceDate

    const rows = await db.rawQuery<{
      rows: Array<{
        id: string
        studentId: string
        grade: number
        assignmentId: string
        maxGrade: number
      }>
    }>(
      `
      SELECT sha.id, sha."studentId", sha.grade,
             sha."assignmentId",
             COALESCE(a.grade, 10) as "maxGrade"
      FROM "StudentHasAssignment" sha
      JOIN "Assignment" a ON a.id = sha."assignmentId"
      WHERE sha.grade IS NOT NULL
        AND sha."createdAt" > ?
      ORDER BY sha."createdAt" ASC
    `,
      [cutoff]
    )

    const records = rows.rows
    this.logger.info(`Assignment grades: ${records.length} registros encontrados (desde ${cutoff})`)

    if (this.dryRun) return records.length

    let count = 0
    for (const row of records) {
      await gamificationEventService.emitGradeReceived({
        gradeId: row.id,
        studentId: row.studentId,
        value: Number(row.grade),
        maxValue: Number(row.maxGrade),
      })
      count++
      if (count % 100 === 0) {
        this.logger.info(`  Assignment grades: ${count}/${records.length} processados`)
      }
    }

    return count
  }

  private async backfillExamGrades(sinceDate: string): Promise<number> {
    const lastDate = await this.getLastEventDate('Grade')
    const cutoff = lastDate ?? sinceDate

    const rows = await db.rawQuery<{
      rows: Array<{
        id: string
        studentId: string
        score: number
        examId: string
        maxScore: number
        title: string
      }>
    }>(
      `
      SELECT eg.id, eg."studentId", eg.score,
             eg."examId", e."maxScore", e.title
      FROM exam_grades eg
      JOIN exams e ON e.id = eg."examId"
      WHERE eg.score IS NOT NULL
        AND eg."createdAt" > ?
      ORDER BY eg."createdAt" ASC
    `,
      [cutoff]
    )

    const records = rows.rows
    this.logger.info(`Exam grades: ${records.length} registros encontrados (desde ${cutoff})`)

    if (this.dryRun) return records.length

    let count = 0
    for (const row of records) {
      await gamificationEventService.emitGradeReceived({
        gradeId: row.id,
        studentId: row.studentId,
        value: Number(row.score),
        maxValue: Number(row.maxScore),
        evaluationName: row.title,
      })
      count++
      if (count % 100 === 0) {
        this.logger.info(`  Exam grades: ${count}/${records.length} processados`)
      }
    }

    return count
  }
}
