import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'

export default class ShowAcademicPeriodController {
  async handle({ params, response }: HttpContext) {
    const academicPeriod = await AcademicPeriod.find(params.id)

    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    return response.ok(academicPeriod)
  }
}
