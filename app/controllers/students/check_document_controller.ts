import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AcademicPeriod from '#models/academic_period'

export default class CheckDocumentController {
  async handle({ request, response }: HttpContext) {
    const { documentNumber, excludeUserId, academicPeriodId } = request.qs()

    if (!documentNumber) {
      return response.badRequest({ message: 'Número do documento é obrigatório' })
    }

    if (!academicPeriodId) {
      return response.badRequest({ message: 'Período letivo é obrigatório' })
    }

    const academicPeriod = await AcademicPeriod.find(academicPeriodId)
    if (!academicPeriod) {
      return response.badRequest({ message: 'Período letivo não encontrado' })
    }

    const query = User.query()
      .where('documentNumber', documentNumber)
      .where('schoolId', academicPeriod.schoolId)

    // Exclude the current user when editing (to allow keeping the same document)
    if (excludeUserId) {
      query.whereNot('id', excludeUserId)
    }

    const existingUser = await query.first()

    return response.ok({
      exists: !!existingUser,
      userName: existingUser?.name || null,
    })
  }
}
