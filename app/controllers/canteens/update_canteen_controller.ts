import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'
import { updateCanteenValidator } from '#validators/canteen'

export default class UpdateCanteenController {
  async handle({ params, request, response }: HttpContext) {
    const canteen = await Canteen.find(params.id)

    if (!canteen) {
      return response.notFound({ message: 'Canteen not found' })
    }

    const data = await request.validateUsing(updateCanteenValidator)

    canteen.merge(data)
    await canteen.save()

    return canteen
  }
}
