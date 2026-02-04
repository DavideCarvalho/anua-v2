import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import UserDto from '#models/dto/user.dto'

export default class LookupResponsibleController {
  async handle({ request, response }: HttpContext) {
    const { documentNumber, schoolId } = request.qs()

    if (!documentNumber) {
      return response.badRequest({ message: 'Número do documento é obrigatório' })
    }

    if (!schoolId) {
      return response.badRequest({ message: 'Escola é obrigatória' })
    }

    const cleanedDocument = documentNumber.replace(/\D/g, '')

    const responsibleRole = await Role.query().where('name', 'STUDENT_RESPONSIBLE').first()

    if (!responsibleRole) {
      return response.internalServerError({ message: 'Role STUDENT_RESPONSIBLE não encontrada' })
    }

    const user = await User.query()
      .where('documentNumber', cleanedDocument)
      .where('schoolId', schoolId)
      .where('roleId', responsibleRole.id)
      .first()

    if (!user) {
      return response.notFound({ message: 'Responsável não encontrado' })
    }

    return response.ok(new UserDto(user))
  }
}
