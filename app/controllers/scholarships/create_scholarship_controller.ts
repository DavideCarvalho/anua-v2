import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import { createScholarshipValidator } from '#validators/scholarship'

export default class CreateScholarshipController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createScholarshipValidator)

    const schoolId = auth.user?.schoolId
    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não possui escola' })
    }

    const discountType = payload.discountType ?? 'PERCENTAGE'
    const isFlat = discountType === 'FLAT'

    const scholarship = await Scholarship.create({
      schoolId,
      name: payload.name,
      type: payload.type,
      discountPercentage: isFlat ? 0 : (payload.discountPercentage ?? 0),
      enrollmentDiscountPercentage: isFlat ? 0 : (payload.enrollmentDiscountPercentage ?? 0),
      discountValue: isFlat ? (payload.discountValue ?? 0) : null,
      enrollmentDiscountValue: isFlat ? (payload.enrollmentDiscountValue ?? 0) : null,
      discountType,
      description: payload.description ?? null,
      schoolPartnerId: payload.schoolPartnerId ?? null,
      code: payload.code ?? null,
      isActive: true,
    })

    await scholarship.load('schoolPartner')

    return response.created(scholarship)
  }
}
