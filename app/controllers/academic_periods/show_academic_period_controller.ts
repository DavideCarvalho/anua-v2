import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AcademicPeriodDto from '#models/dto/academic_period.dto'

export default class ShowAcademicPeriodController {
  async handle({ params, response }: HttpContext) {
    const academicPeriod = await AcademicPeriod.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .first()

    if (!academicPeriod) {
      return response.notFound({ message: 'Período letivo não encontrado' })
    }

    return new AcademicPeriodDto(academicPeriod)
  }
}
