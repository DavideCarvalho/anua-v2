import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'

export default class DeleteCanteenController {
  async handle({ params, response }: HttpContext) {
    const canteen = await Canteen.find(params.id)

    if (!canteen) {
      return response.notFound({ message: 'Canteen not found' })
    }

    await canteen.delete()

    return response.noContent()
  }
}
