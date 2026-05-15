/**
 * Attendance Audit Service
 *
 * Concentra a lógica de auditoria de presenças. Sempre que uma célula
 * (StudentHasAttendance) muda — seja via batch que sobrescreve uma chamada
 * inteira, seja via edição cirúrgica de uma só célula — passa por aqui.
 *
 * Responsabilidades:
 * - Escrever um registro em AttendanceEdit por mudança real (status ou
 *   justificativa diferente do estado anterior).
 * - Manter lastEditedById/lastEditedAt na StudentHasAttendance e no
 *   Attendance pai sincronizados.
 *
 * Não decide políticas (quem pode editar, se o bimestre está fechado): isso
 * fica nos controllers/middlewares. Aqui é só "registrar o que aconteceu".
 */

import { DateTime } from 'luxon'
import AttendanceEdit from '#models/attendance_edit'
import Attendance from '#models/attendance'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'

export interface AttendanceChange {
  studentHasAttendanceId: string
  previousStatus: AttendanceStatus | null
  previousJustification: string | null
  newStatus: AttendanceStatus
  newJustification: string | null
}

export interface RecordEditOptions {
  changes: AttendanceChange[]
  editedById: string | null
  reason?: string | null
}

export default class AttendanceAuditService {
  /**
   * Registra mudanças e sincroniza os carimbos de última edição.
   * Filtra automaticamente mudanças que não são reais (mesmo status e
   * mesma justificativa).
   */
  static async recordEdits({ changes, editedById, reason }: RecordEditOptions) {
    const real = changes.filter(
      (c) => c.previousStatus !== c.newStatus || c.previousJustification !== c.newJustification
    )

    if (real.length === 0) return

    const now = DateTime.utc()

    await AttendanceEdit.createMany(
      real.map((c) => ({
        studentHasAttendanceId: c.studentHasAttendanceId,
        previousStatus: c.previousStatus,
        previousJustification: c.previousJustification,
        newStatus: c.newStatus,
        newJustification: c.newJustification,
        reason: reason ?? null,
        editedById,
        editedAt: now,
      }))
    )

    const shaIds = real.map((c) => c.studentHasAttendanceId)
    await StudentHasAttendance.query()
      .whereIn('id', shaIds)
      .update({ lastEditedById: editedById, lastEditedAt: now })

    const attendanceIds = await StudentHasAttendance.query()
      .whereIn('id', shaIds)
      .select('attendanceId')
      .distinct()
      .then((rows) => rows.map((r) => r.attendanceId))

    if (attendanceIds.length > 0) {
      await Attendance.query()
        .whereIn('id', attendanceIds)
        .update({ lastEditedById: editedById, lastEditedAt: now })
    }
  }
}
