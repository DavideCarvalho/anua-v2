import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AcademicPeriod from '#models/academic_period'
import AppException from '#exceptions/app_exception'

export default class CheckEmailController {
  async handle({ request, response }: HttpContext) {
    const { email, excludeUserId, academicPeriodId } = request.qs()

    if (!email) {
      throw AppException.badRequest('Email é obrigatório')
    }

    if (!academicPeriodId) {
      throw AppException.badRequest('Período letivo é obrigatório')
    }

    const academicPeriod = await AcademicPeriod.find(academicPeriodId)
    if (!academicPeriod) {
      throw AppException.notFound('Período letivo não encontrado')
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
    })
  }
}
