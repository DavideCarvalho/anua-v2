import type { HttpContext } from '@adonisjs/core/http'
import QRCode from 'qrcode'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import AppException from '#exceptions/app_exception'
import { computeAxesStatus } from '#services/enrollment_axes_service'
import CalendarTokenService from '#services/calendar_token_service'

export default class GetEnrollmentCertificateController {
  async handle({ params, request, effectiveUser }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const matricula = await StudentHasLevel.query()
      .where('id', params.matriculaId)
      .whereNull('deletedAt')
      .preload('student', (q) => q.preload('user'))
      .preload('level')
      .preload('academicPeriod')
      .preload('contract', (q) => q.preload('school'))
      .first()

    if (!matricula) {
      throw AppException.notFound('Matrícula não encontrada')
    }

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', matricula.studentId)
      .first()

    if (!relation) {
      throw AppException.forbidden('Sem permissão')
    }

    const axes = await computeAxesStatus(matricula.id)
    if (!axes?.isComplete) {
      throw AppException.badRequest('Matrícula ainda não está concluída')
    }

    const token = CalendarTokenService.generate(matricula.studentId, effectiveUser.id)
    const baseUrl = request.completeUrl().split('/api/')[0]
    const verificationUrl = `${baseUrl}/api/v1/verify-enrollment/${token}`
    const qrCodeDataUrl = await QRCode.toDataURL(verificationUrl, { width: 200, margin: 1 })

    return {
      studentName: matricula.student?.user?.name ?? null,
      levelName: matricula.level?.name ?? null,
      academicPeriodName: matricula.academicPeriod?.name ?? null,
      schoolName: matricula.contract?.school?.name ?? null,
      enrollmentId: matricula.id,
      completedAt: matricula.updatedAt.toISO(),
      verificationUrl,
      qrCodeDataUrl,
    }
  }
}
