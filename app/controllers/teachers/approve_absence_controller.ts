import type { HttpContext } from '@adonisjs/core/http'
import Absence from '#models/absence'
import { approveAbsenceValidator } from '#validators/teacher_timesheet'

export default class ApproveAbsenceController {
  async handle({ request, response }: HttpContext) {
    const { absenceId } = await request.validateUsing(approveAbsenceValidator)

    const absence = await Absence.find(absenceId)
    if (!absence) {
      return response.notFound({ message: 'Falta não encontrada' })
    }

    absence.status = 'APPROVED'
    absence.rejectionReason = null
    await absence.save()

    return response.ok(absence)
  }
}
