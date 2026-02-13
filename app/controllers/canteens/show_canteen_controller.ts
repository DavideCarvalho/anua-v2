import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'
import AppException from '#exceptions/app_exception'

export default class ShowCanteenController {
  async handle({ params }: HttpContext) {
    const canteen = await Canteen.query()
      .where('id', params.id)
      .preload('school')
      .preload('responsibleUser')
      .preload('items')
      .first()

    if (!canteen) {
      throw AppException.notFound('Cantina não encontrada')
    }

    return canteen
  }
}
