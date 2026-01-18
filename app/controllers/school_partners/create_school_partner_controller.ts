import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SchoolPartner from '#models/school_partner'
import { createSchoolPartnerValidator } from '#validators/school_partner'

export default class CreateSchoolPartnerController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(createSchoolPartnerValidator)

    const schoolId = auth.user?.schoolId
    if (!schoolId) {
      return response.badRequest({ message: 'Usuário não possui escola' })
    }

    const partner = await SchoolPartner.create({
      schoolId,
      name: payload.name,
      cnpj: payload.cnpj,
      email: payload.email ?? null,
      phone: payload.phone ?? null,
      contactName: payload.contactName ?? null,
      discountPercentage: payload.discountPercentage,
      partnershipStartDate: DateTime.fromJSDate(payload.partnershipStartDate),
      partnershipEndDate: payload.partnershipEndDate
        ? DateTime.fromJSDate(payload.partnershipEndDate)
        : null,
      isActive: true,
    })

    return response.created(partner)
  }
}
