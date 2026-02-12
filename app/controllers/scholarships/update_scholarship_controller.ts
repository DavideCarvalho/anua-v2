import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import { updateScholarshipValidator } from '#validators/scholarship'
import AppException from '#exceptions/app_exception'

export default class UpdateScholarshipController {
  async handle({ request, params, response, selectedSchoolIds }: HttpContext) {
    const payload = await request.validateUsing(updateScholarshipValidator)

    const scholarship = await Scholarship.query()
      .where('id', params.id)
      .whereIn('schoolId', selectedSchoolIds ?? [])
      .first()

    if (!scholarship) {
      throw AppException.notFound('Bolsa não encontrada')
    }

    const discountType = payload.discountType ?? scholarship.discountType
    const isFlat = discountType === 'FLAT'

    scholarship.merge({
      name: payload.name ?? scholarship.name,
      type: payload.type ?? scholarship.type,
      discountPercentage:
        payload.discountPercentage !== undefined
          ? payload.discountPercentage
          : scholarship.discountPercentage,
      enrollmentDiscountPercentage:
        payload.enrollmentDiscountPercentage !== undefined
          ? payload.enrollmentDiscountPercentage
          : scholarship.enrollmentDiscountPercentage,
      discountValue: isFlat
        ? payload.discountValue !== undefined
          ? payload.discountValue
          : scholarship.discountValue
        : null,
      enrollmentDiscountValue: isFlat
        ? payload.enrollmentDiscountValue !== undefined
          ? payload.enrollmentDiscountValue
          : scholarship.enrollmentDiscountValue
        : null,
      discountType,
      description:
        payload.description !== undefined ? (payload.description ?? null) : scholarship.description,
      schoolPartnerId:
        payload.schoolPartnerId !== undefined
          ? (payload.schoolPartnerId ?? null)
          : scholarship.schoolPartnerId,
      code: payload.code !== undefined ? (payload.code ?? null) : scholarship.code,
    })

    await scholarship.save()
    await scholarship.load('schoolPartner')

    return response.ok(scholarship)
  }
}
