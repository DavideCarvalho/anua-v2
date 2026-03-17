import type { HttpContext } from '@adonisjs/core/http'
import AcademicPeriod from '#models/academic_period'
import AppException from '#exceptions/app_exception'
import AcademicPeriodTransformer from '#transformers/academic_period_transformer'

export default class ShowAcademicPeriodController {
  async handle({ params, serialize }: HttpContext) {
    const academicPeriod = await AcademicPeriod.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .first()

    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
    }

    return serialize(AcademicPeriodTransformer.transform(academicPeriod))
  }
}
