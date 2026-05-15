import type { HttpContext } from '@adonisjs/core/http'
import StudentHasAttendance from '#models/student_has_attendance'
import AttendanceAttachment from '#models/attendance_attachment'
import AppException from '#exceptions/app_exception'

export default class ListAttendanceAttachmentsController {
  async handle({ params, response, serialize }: HttpContext) {
    const studentAttendance = await StudentHasAttendance.find(params.id)
    if (!studentAttendance) {
      throw AppException.notFound('Registro de presença não encontrado')
    }

    const attachments = await AttendanceAttachment.query()
      .where('studentHasAttendanceId', studentAttendance.id)
      .preload('uploadedBy')
      .orderBy('createdAt', 'asc')

    const items = attachments.map((att) => ({
      id: att.id,
      fileName: att.fileName,
      mimeType: att.mimeType,
      fileSizeBytes: att.fileSizeBytes,
      fileUrl: att.file?.url ?? null,
      uploadedBy: att.uploadedBy ? { id: att.uploadedBy.id, name: att.uploadedBy.name } : null,
      createdAt: att.createdAt.toISO(),
    }))

    return response.ok(await serialize({ attachments: items }))
  }
}
