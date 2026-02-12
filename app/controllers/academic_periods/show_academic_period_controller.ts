import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AcademicPeriodDto from '#models/dto/academic_period.dto'
import AppException from '#exceptions/app_exception'

export default class ShowAcademicPeriodController {
  async handle({ params }: HttpContext) {
    const academicPeriod = await AcademicPeriod.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .first()

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    return new AcademicPeriodDto(academicPeriod)
  }
}
