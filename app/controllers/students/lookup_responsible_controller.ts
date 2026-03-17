import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import Role from '#models/role'
import UserTransformer from '#transformers/user_transformer'
import AppException from '#exceptions/app_exception'
import { lookupResponsibleValidator } from '#validators/student'

export default class LookupResponsibleController {
  async handle({ request, response, serialize }: HttpContext) {
    const { documentNumber, schoolId } = await request.validateUsing(lookupResponsibleValidator)

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

    return response.ok(await serialize(UserTransformer.transform(user)))
  }
}
