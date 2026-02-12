import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import CanteenDto from '#models/dto/canteen.dto'
import { updateCanteenValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class UpdateCanteenController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const canteen = await Canteen.query()
      .where('id', params.id)
      .whereIn('schoolId', selectedSchoolIds ?? [])
      .first()

    if (!canteen) {
      throw AppException.notFound('Cantina não encontrada')
    }

    const data = await request.validateUsing(updateCanteenValidator)

    const updatedCanteen = await db.transaction(async (trx) => {
      canteen.merge({
        responsibleUserId:
          data.responsibleUserId !== undefined ? data.responsibleUserId : canteen.responsibleUserId,
      })
      await canteen.useTransaction(trx).save()
      return canteen
    })

    return response.ok(new CanteenDto(updatedCanteen))
  }
}
