import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import { findScholarshipValidator } from '#validators/online_enrollment'
import AppException from '#exceptions/app_exception'

export default class FindScholarshipByCodeController {
  async handle({ request, response }: HttpContext) {
    const { code, schoolId } = await request.validateUsing(findScholarshipValidator)

    const scholarship = await Scholarship.query()
      .where('code', code)
      .where('schoolId', schoolId)
      .where('isActive', true)
      .first()

    if (!scholarship) {
      throw AppException.notFound('Bolsa não encontrada ou inválida')
    }

    return response.ok({
      id: scholarship.id,
      name: scholarship.name,
      code: scholarship.code,
      type: scholarship.type,
      discountPercentage: scholarship.discountPercentage,
      enrollmentDiscountPercentage: scholarship.enrollmentDiscountPercentage,
    })
  }
}
