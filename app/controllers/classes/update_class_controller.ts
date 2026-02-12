import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import ClassDto from '#models/dto/class.dto'
import { updateClassValidator } from '#validators/class'
import AppException from '#exceptions/app_exception'

export default class UpdateClassController {
  async handle({ params, request, response, selectedSchoolIds }: HttpContext) {
    const classEntity = await Class_.query()
      .where('id', params.id)
      .whereIn('schoolId', selectedSchoolIds ?? [])
      .first()

    if (!classEntity) {
      throw AppException.notFound('Turma não encontrada')
    }

    const data = await request.validateUsing(updateClassValidator)

    // Usa transaction e extrai campos explicitamente (evita mass assignment)
    const updatedClass = await db.transaction(async (trx) => {
      classEntity.merge({
        name: data.name ?? classEntity.name,
        isArchived: data.status === 'ARCHIVED',
      })

      await classEntity.useTransaction(trx).save()
      return classEntity
    })

    return response.ok(new ClassDto(updatedClass))
  }
}
