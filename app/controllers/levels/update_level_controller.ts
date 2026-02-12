import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Level from '#models/level'
import LevelDto from '#models/dto/level.dto'
import { updateLevelValidator } from '#validators/level'
import AppException from '#exceptions/app_exception'

export default class UpdateLevelController {
  async handle({ params, request, response }: HttpContext) {
    const level = await Level.find(params.id)

    if (!level) {
      throw AppException.notFound('Nível não encontrado')
    }

    const data = await request.validateUsing(updateLevelValidator)

    const updatedLevel = await db.transaction(async (trx) => {
      level.merge({
        name: data.name ?? level.name,
        order: data.order !== undefined ? data.order : level.order,
        contractId: data.contractId !== undefined ? data.contractId : level.contractId,
        isActive: data.isActive ?? level.isActive,
      })
      await level.useTransaction(trx).save()
      return level
    })

    return response.ok(new LevelDto(updatedLevel))
  }
}
