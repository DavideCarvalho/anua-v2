import type { HttpContext } from '@adonisjs/core/http'
import Contract from '#models/contract'
import AcademicPeriod from '#models/academic_period'

export default class ShowEditarContratoPageController {
  async handle({ inertia, params, auth, response }: HttpContext) {
    const schoolId = auth.user?.schoolId

    const contract = await Contract.query()
      .where('id', params.id)
      .preload('paymentDays')
      .preload('interestConfig')
      .preload('earlyDiscounts')
      .first()

    if (!contract) {
      return response.notFound({ message: 'Contrato não encontrado' })
    }

    const academicPeriods = schoolId
      ? await AcademicPeriod.query()
          .where('schoolId', schoolId)
          .orderBy('startDate', 'desc')
      : []

    return inertia.render('escola/administrativo/contratos/editar', {
      contract,
      academicPeriods,
    })
  }
}
