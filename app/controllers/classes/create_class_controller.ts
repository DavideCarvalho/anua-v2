import type { HttpContext } from '@adonisjs/core/http'
import db from '@adonisjs/lucid/services/db'
import Class_ from '#models/class'
import ClassDto from '#models/dto/class.dto'
import { createClassValidator } from '#validators/class'
import AppException from '#exceptions/app_exception'

export default class CreateClassController {
  async handle({ request, response, selectedSchoolIds }: HttpContext) {
    const data = await request.validateUsing(createClassValidator)

    // Verifica se a escola está no contexto do usuário
    if (!selectedSchoolIds?.includes(data.schoolId)) {
      throw AppException.forbidden('Sem permissão para criar turma nesta escola')
    }

    // Usa transaction para garantir atomicidade
    const classEntity = await db.transaction(async (trx) => {
      // Cria classe explicitando campos permitidos (evita mass assignment)
      // Nota: Os campos description, maxStudents, status são ignorados pois não existem no model
      const newClass = await Class_.create(
        {
          name: data.name,
          levelId: data.levelId ?? null,
          schoolId: data.schoolId,
          isArchived: false,
        },
        { client: trx }
      )

      return newClass
    })

    return response.created(new ClassDto(classEntity))
  }
}
