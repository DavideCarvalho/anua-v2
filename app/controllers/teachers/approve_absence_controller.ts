import type { HttpContext } from '@adonisjs/core/http'
import Absence from '#models/absence'
import { approveAbsenceValidator } from '#validators/teacher_timesheet'
import AppException from '#exceptions/app_exception'
import AbsenceDto from '#models/dto/absence.dto'

export default class ApproveAbsenceController {
  async handle({ request, response }: HttpContext) {
    const { absenceId } = await request.validateUsing(approveAbsenceValidator)

    const absence = await Absence.find(absenceId)
    if (!absence) {
      throw AppException.notFound('Falta não encontrada')
    }

    absence.status = 'APPROVED'
    absence.rejectionReason = null
    await absence.save()

    return response.ok(new AbsenceDto(absence))
  }
}
