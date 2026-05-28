import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'

export default class ShowMatriculasPageController {
  async handle({ inertia, selectedSchoolIds }: HttpContext) {
    const schoolId = selectedSchoolIds?.[0] ?? ''

    const activePeriodCount = await AcademicPeriod.query()
      .where('schoolId', schoolId)
      .where('isActive', true)
      .where('isClosed', false)
      .count('* as total')
      .first()

    return inertia.render('escola/matriculas', {
      hasActivePeriod: Number(activePeriodCount?.$extras.total ?? 0) > 0,
    })
  }
}
