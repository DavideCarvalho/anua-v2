import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'

export default class ShowCanteenController {
  async handle({ params, response }: HttpContext) {
    const canteen = await Canteen.query()
      .where('id', params.id)
      .preload('school')
      .preload('responsibleUser')
      .preload('items')
      .first()

    if (!canteen) {
      return response.notFound({ message: 'Canteen not found' })
    }

    return canteen
  }
}
