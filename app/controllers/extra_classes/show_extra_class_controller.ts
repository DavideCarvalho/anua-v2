import type { HttpContext } from '@adonisjs/core/http'
import ExtraClass from '#models/extra_class'
import ExtraClassDto from '#models/dto/extra_class.dto'

export default class ShowExtraClassController {
  async handle({ params, response }: HttpContext) {
    const extraClass = await ExtraClass.query()
      .where('id', params.id)
      .preload('schedules')
      .preload('teacher', (q) => q.preload('user'))
      .preload('contract', (q) => q.preload('paymentDays'))
      .preload('academicPeriod')
      .withCount('enrollments', (q) => q.whereNull('cancelledAt'))
      .first()

    if (!extraClass) {
      return response.notFound({ message: 'Aula avulsa não encontrada' })
    }

    return new ExtraClassDto(extraClass)
  }
}
