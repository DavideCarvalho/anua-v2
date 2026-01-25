import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'

export default class ShowNovoContratoPageController {
  async handle({ inertia, auth }: HttpContext) {
    const schoolId = auth.user?.schoolId

    const academicPeriods = schoolId
      ? await AcademicPeriod.query()
          .where('schoolId', schoolId)
          .orderBy('startDate', 'desc')
      : []

    return inertia.render('escola/administrativo/contratos/novo', {
      academicPeriods,
    })
  }
}
