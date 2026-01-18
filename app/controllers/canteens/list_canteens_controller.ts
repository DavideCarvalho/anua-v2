import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'
import { listCanteensValidator } from '#validators/canteen'

export default class ListCanteensController {
  async handle({ request }: HttpContext) {
    const { schoolId, page, limit } = await request.validateUsing(listCanteensValidator)

    const query = Canteen.query().preload('school').preload('responsibleUser')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const canteens = await query.paginate(page ?? 1, limit ?? 10)

    return canteens
  }
}
