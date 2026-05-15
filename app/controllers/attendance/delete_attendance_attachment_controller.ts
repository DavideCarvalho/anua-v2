import type { HttpContext } from '@adonisjs/core/http'
import AttendanceAttachment from '#models/attendance_attachment'
import AppException from '#exceptions/app_exception'

export default class DeleteAttendanceAttachmentController {
  async handle({ params, response }: HttpContext) {
    const attachment = await AttendanceAttachment.find(params.attachmentId)
    if (!attachment || attachment.studentHasAttendanceId !== params.id) {
      throw AppException.notFound('Anexo não encontrado')
    }

    // Apagar o registro dispara o cleanup do adonis-attachment no disco.
    await attachment.delete()

    return response.noContent()
  }
}
