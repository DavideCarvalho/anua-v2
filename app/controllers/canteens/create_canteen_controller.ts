import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Canteen from '#models/canteen'
import CanteenDto from '#models/dto/canteen.dto'
import { createCanteenValidator } from '#validators/canteen'
import AppException from '#exceptions/app_exception'

export default class CreateCanteenController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const data = await request.validateUsing(createCanteenValidator)

    // Verifica se a escola está no contexto do usuário
    if (!selectedSchoolIds?.includes(data.schoolId)) {
      throw AppException.forbidden('Sem permissão para criar cantina nesta escola')
    }

    // Usa transaction para garantir atomicidade
    const canteen = await db.transaction(async (trx) => {
      // Cria canteen explicitando campos permitidos (evita mass assignment)
      const newCanteen = await Canteen.create(
        {
          schoolId: data.schoolId,
          responsibleUserId: data.responsibleUserId,
        },
        { client: trx }
      )

      return newCanteen
    })

    return response.created(new CanteenDto(canteen))
  }
}
