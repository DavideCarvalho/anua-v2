import type { HttpContext } from '@adonisjs/core/http'
import Absence from '#models/absence'
import { rejectAbsenceValidator } from '#validators/teacher_timesheet'

export default class RejectAbsenceController {
  async handle({ request, response }: HttpContext) {
    const { absenceId, rejectionReason } = await request.validateUsing(rejectAbsenceValidator)

    const absence = await Absence.find(absenceId)
    if (!absence) {
      return response.notFound({ message: 'Falta não encontrada' })
    }

    absence.status = 'REJECTED'
    absence.rejectionReason = rejectionReason
    await absence.save()

    return response.ok(absence)
  }
}
