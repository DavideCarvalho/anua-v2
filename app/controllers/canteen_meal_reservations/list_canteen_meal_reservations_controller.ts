import type { HttpContext } from '@adonisjs/core/http'
import Canteen from '#models/canteen'
import CanteenMealReservation from '#models/canteen_meal_reservation'
import CanteenMealReservationTransformer from '#transformers/canteen_meal_reservation_transformer'
import { listCanteenMealReservationsValidator } from '#validators/canteen'

function mapStatus(status: string) {
  if (status === 'SERVED') return 'SERVED'
  if (status === 'CANCELLED') return 'CANCELLED'
  return 'RESERVED'
}

export default class ListCanteenMealReservationsController {
  async handle({ request, serialize, selectedSchoolIds }: HttpContext) {
    const payload = await request.validateUsing(listCanteenMealReservationsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const query = CanteenMealReservation.query()
      .preload('meal', (mealQuery) => mealQuery.preload('canteen'))
      .preload('student', (studentQuery) => studentQuery.preload('user'))
      .orderBy('createdAt', 'desc')

    // Validator provides canteenMealId, model expects mealId
    if (payload.canteenMealId) {
      query.where('mealId', payload.canteenMealId)
    }

    // Validator provides userId, model expects studentId
    if (payload.userId) {
      query.where('studentId', payload.userId)
    }

    if (payload.status) {
      query.where('status', mapStatus(payload.status))
    }

    if (payload.canteenId) {
      query.whereHas('meal', (mealQuery) => {
        mealQuery.where('canteenId', payload.canteenId!)
      })
    } else if (selectedSchoolIds && selectedSchoolIds.length > 0) {
      const canteenIds = (await Canteen.query().whereIn('schoolId', selectedSchoolIds).select('id'))
        .map((c) => c.id)
      if (canteenIds.length > 0) {
        query.whereHas('meal', (mealQuery) => {
          mealQuery.whereIn('canteenId', canteenIds)
        })
      }
    }

    if (payload.date) {
      const filterDate = String(payload.date)
      query.whereHas('meal', (mealQuery) => {
        mealQuery.where('date', filterDate)
      })
    }

    const reservations = await query.paginate(page, limit)

    const data = reservations.all()
    const metadata = reservations.getMeta()

    return serialize(CanteenMealReservationTransformer.paginate(data, metadata))
  }
}
