import type { HttpContext } from '@adonisjs/core/http'
import ExtraClass from '#models/extra_class'
import ExtraClassTransformer from '#transformers/extra_class_transformer'
import AppException from '#exceptions/app_exception'

export default class ShowExtraClassController {
  async handle({ params, serialize }: HttpContext) {
    const extraClass = await ExtraClass.query()
      .where('id', params.id)
      .preload('schedules')
      .preload('teacher', (q) => q.preload('user'))
      .preload('contract', (q) => q.preload('paymentDays'))
      .preload('academicPeriod')
      .withCount('enrollments', (q) => q.whereNull('cancelledAt'))
      .first()

    if (!extraClass) {
      throw AppException.notFound('Aula avulsa não encontrada')
    }

    return await serialize(ExtraClassTransformer.transform(extraClass))
  }
}
