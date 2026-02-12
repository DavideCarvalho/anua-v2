import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import UserDto from '#models/dto/user.dto'
import AppException from '#exceptions/app_exception'

export default class LookupResponsibleController {
  async handle({ request, response }: HttpContext) {
    const { documentNumber, schoolId } = request.qs()

    if (!documentNumber) {
      throw AppException.badRequest('Número do documento é obrigatório')
    }

    if (!schoolId) {
      throw AppException.badRequest('Escola é obrigatória')
    }

    const cleanedDocument = documentNumber.replace(/\D/g, '')

    const responsibleRole = await Role.query().where('name', 'STUDENT_RESPONSIBLE').first()

    if (!responsibleRole) {
      throw AppException.internalServerError('Role STUDENT_RESPONSIBLE não encontrada')
    }

    const user = await User.query()
      .where('documentNumber', cleanedDocument)
      .where('schoolId', schoolId)
      .where('roleId', responsibleRole.id)
      .first()

    if (!user) {
      throw AppException.notFound('Responsável não encontrado')
    }

    return response.ok(new UserDto(user))
  }
}
