import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance, { type AttendanceStatus } from '#models/student_has_attendance'
import AcademicSubPeriod from '#models/academic_sub_period'
import { updateAttendanceValidator } from '#validators/attendance'
import AppException from '#exceptions/app_exception'
import StudentHasAttendanceTransformer from '#transformers/student_has_attendance_transformer'
import AttendanceAuditService from '#services/attendance_audit_service'

function mapStatus(validatorStatus: string): AttendanceStatus {
  return validatorStatus as AttendanceStatus
}

export default class UpdateAttendanceController {
  async handle({ params, request, response, auth, effectiveUser, serialize }: HttpContext) {
    const studentAttendance = await StudentHasAttendance.query()
      .where('id', params.id)
      .preload('attendance', (query) => {
        query.preload('calendarSlot', (slotQuery) => {
          slotQuery.preload('calendar')
        })
      })
      .first()

    if (!studentAttendance) {
      throw AppException.notFound('Registro de presença não encontrado')
    }

    const data = await request.validateUsing(updateAttendanceValidator)
    const editorId = (effectiveUser ?? auth.user)?.id ?? null

    const previousStatus = studentAttendance.status
    const previousJustification = studentAttendance.justification

    const nextStatus = data.status !== undefined ? mapStatus(data.status) : previousStatus
    const nextJustification =
      data.justification !== undefined ? data.justification : previousJustification

    const statusChanged = nextStatus !== previousStatus
    const justificationChanged = nextJustification !== previousJustification

    if (!statusChanged && !justificationChanged) {
      return response.ok(
        await serialize(StudentHasAttendanceTransformer.transform(studentAttendance))
      )
    }

    const attendanceDate = studentAttendance.attendance?.date
    const calendar = studentAttendance.attendance?.calendarSlot?.calendar
    if (attendanceDate && calendar) {
      const lockedSubPeriod = await AcademicSubPeriod.query()
        .where('academicPeriodId', calendar.academicPeriodId)
        .where('isLocked', true)
        .where('startDate', '<=', attendanceDate.toSQLDate()!)
        .where('endDate', '>=', attendanceDate.toSQLDate()!)
        .first()

      if (lockedSubPeriod) {
        const reason = data.reason?.trim()
        if (!reason) {
          throw AppException.badRequest(
            'Este bimestre está encerrado. Informe o motivo da retificação para continuar.'
          )
        }
      }
    }

    studentAttendance.status = nextStatus
    studentAttendance.justification = nextJustification
    await studentAttendance.save()

    await AttendanceAuditService.recordEdits({
      changes: [
        {
          studentHasAttendanceId: studentAttendance.id,
          previousStatus,
          previousJustification,
          newStatus: nextStatus,
          newJustification: nextJustification,
        },
      ],
      editedById: editorId,
      reason: data.reason ?? null,
    })

    return response.ok(
      await serialize(StudentHasAttendanceTransformer.transform(studentAttendance))
    )
  }
}
