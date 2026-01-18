import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import { updateScholarshipValidator } from '#validators/scholarship'

export default class UpdateScholarshipController {
  async handle({ request, params, response }: HttpContext) {
    const payload = await request.validateUsing(updateScholarshipValidator)

    const scholarship = await Scholarship.find(params.id)
    if (!scholarship) {
      return response.notFound({ message: 'Bolsa não encontrada' })
    }

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
