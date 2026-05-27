import type { HttpContext } from '@adonisjs/core/http'
import CalendarTokenService from '#services/calendar_token_service'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import { computeAxesStatus } from '#services/enrollment_axes_service'
import AppException from '#exceptions/app_exception'

export default class VerifyEnrollmentController {
  async handle({ params, response }: HttpContext) {
    const parsed = CalendarTokenService.verify(params.token)
    if (!parsed) {
      throw AppException.forbidden('Link de verificação inválido')
    }

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', parsed.userId)
      .where('studentId', parsed.studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Relação não encontrada')
    }

    const matricula = await StudentHasLevel.query()
      .where('studentId', parsed.studentId)
      .whereNull('deletedAt')
      .preload('student', (q) => q.preload('user'))
      .preload('level')
      .preload('academicPeriod')
      .preload('contract', (q) => q.preload('school'))
      .orderBy('createdAt', 'desc')
      .first()

    if (!matricula) {
      throw AppException.notFound('Matrícula não encontrada')
    }

    const axes = await computeAxesStatus(matricula.id)

    return response.ok({
      valid: !!axes?.isComplete,
      studentName: matricula.student?.user?.name ?? null,
      levelName: matricula.level?.name ?? null,
      academicPeriodName: matricula.academicPeriod?.name ?? null,
      schoolName: matricula.contract?.school?.name ?? null,
      enrollmentId: matricula.id,
      status: axes?.isComplete ? 'CONCLUÍDA' : 'PENDENTE',
    })
  }
}
