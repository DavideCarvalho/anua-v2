import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Level from '#models/level'
import Class_ from '#models/class'
import AppException from '#exceptions/app_exception'

export default class DeleteLevelController {
  async handle({ params, response, selectedSchoolIds }: HttpContext) {
    const level = await Level.query()
      .where('id', params.id)
      .whereIn('schoolId', selectedSchoolIds ?? [])
      .first()

    if (!level) {
      throw AppException.notFound('Nível não encontrado')
    }

    await db.transaction(async (trx) => {
      await Class_.query({ client: trx }).where('levelId', level.id).update({
        isArchived: true,
        levelId: null,
      })

      await level.useTransaction(trx).delete()
    })

    return response.noContent()
  }
}
