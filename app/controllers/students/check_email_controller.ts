import type { HttpContext } from '@adonisjs/core/http'
import User from '#models/user'
import AcademicPeriod from '#models/academic_period'
import AppException from '#exceptions/app_exception'
import { checkEmailValidator } from '#validators/student'

export default class CheckEmailController {
  async handle({ request, response }: HttpContext) {
    const { email, excludeUserId, academicPeriodId } =
      await request.validateUsing(checkEmailValidator)

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
