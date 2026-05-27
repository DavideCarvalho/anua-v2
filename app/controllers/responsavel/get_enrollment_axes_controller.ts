import type { HttpContext } from '@adonisjs/core/http'
import StudentHasLevel from '#models/student_has_level'
import StudentHasResponsible from '#models/student_has_responsible'
import StudentPayment from '#models/student_payment'
import Class_ from '#models/class'
import AppException from '#exceptions/app_exception'
import { computeAxesStatus } from '#services/enrollment_axes_service'
import EnrollmentAxesTransformer from '#transformers/enrollment_axes_transformer'

export default class GetEnrollmentAxesController {
  async handle({ params, effectiveUser, response }: HttpContext) {
    if (!effectiveUser) {
      throw AppException.invalidCredentials()
    }

    const matricula = await StudentHasLevel.query()
      .where('id', params.matriculaId)
      .whereNull('deletedAt')
      .preload('student', (q) => q.preload('user'))
      .preload('level')
      .preload('academicPeriod')
      .preload('contract')
      .first()

    if (!matricula) {
      throw AppException.notFound('Matrícula não encontrada')
    }

    const relation = await StudentHasResponsible.query()
      .where('responsibleId', effectiveUser.id)
      .where('studentId', matricula.studentId)
      .first()
    if (!relation) {
      throw AppException.forbidden('Você não tem permissão para ver esta matrícula')
    }

    const axes = await computeAxesStatus(matricula.id)
    if (!axes) {
      throw AppException.notFound('Não foi possível calcular o status da matrícula')
    }

    const enrollmentPayment = matricula.enrollmentPaymentId
      ? await StudentPayment.find(matricula.enrollmentPaymentId)
      : null

    const allocatedClass = matricula.classId ? await Class_.find(matricula.classId) : null

    const enrollmentDeadline = matricula.academicPeriod?.enrollmentEndDate?.toISO() ?? null

    return response.ok(
      EnrollmentAxesTransformer.transform({
        matricula,
        axes,
        enrollmentPayment,
        allocatedClass,
        enrollmentDeadline,
      })
    )
  }
}
