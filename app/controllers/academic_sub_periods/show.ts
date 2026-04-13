import type { HttpContext } from '@adonisjs/core/http'
import AcademicSubPeriod from '#models/academic_sub_period'
import AppException from '#exceptions/app_exception'
import AcademicSubPeriodTransformer from '#transformers/academic_sub_period_transformer'

export default class ShowAcademicSubPeriodController {
  async handle({ params, serialize }: HttpContext) {
    const subPeriod = await AcademicSubPeriod.query()
      .where('id', params.id)
      .whereNull('deletedAt')
      .first()

    if (!subPeriod) {
      throw AppException.notFound('Sub-período letivo não encontrado')
    }

    return serialize(AcademicSubPeriodTransformer.transform(subPeriod))
  }
}
