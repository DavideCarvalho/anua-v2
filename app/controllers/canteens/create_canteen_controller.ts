import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'
import { createCanteenValidator } from '#validators/canteen'

export default class CreateCanteenController {
  async handle({ request, response }: HttpContext) {
    const data = await request.validateUsing(createCanteenValidator)

    const canteen = await Canteen.create(data)

    return response.created(canteen)
  }
}
