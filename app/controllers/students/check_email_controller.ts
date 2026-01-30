import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AcademicPeriod from '#models/academic_period'

export default class CheckEmailController {
  async handle({ request, response }: HttpContext) {
    const { email, excludeUserId, academicPeriodId } = request.qs()

    if (!email) {
      return response.badRequest({ message: 'Email é obrigatório' })
    }

    if (!academicPeriodId) {
      return response.badRequest({ message: 'Período letivo é obrigatório' })
    }

    const academicPeriod = await AcademicPeriod.find(academicPeriodId)
    if (!academicPeriod) {
      return response.badRequest({ message: 'Período letivo não encontrado' })
    }

    const query = User.query()
      .where('email', email.trim().toLowerCase())
      .where('schoolId', academicPeriod.schoolId)

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
