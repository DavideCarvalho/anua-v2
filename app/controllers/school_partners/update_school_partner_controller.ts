import type { HttpContext } from '@adonisjs/core/http'
import { DateTime } from 'luxon'
import SchoolPartner from '#models/school_partner'
import { updateSchoolPartnerValidator } from '#validators/school_partner'

export default class UpdateSchoolPartnerController {
  async handle({ request, params, response }: HttpContext) {
    const payload = await request.validateUsing(updateSchoolPartnerValidator)

    const partner = await SchoolPartner.find(params.id)
    if (!partner) {
      return response.notFound({ message: 'Parceiro não encontrado' })
    }

    partner.merge({
      name: payload.name ?? partner.name,
      cnpj: payload.cnpj ?? partner.cnpj,
      email: payload.email !== undefined ? (payload.email ?? null) : partner.email,
      phone: payload.phone !== undefined ? (payload.phone ?? null) : partner.phone,
      contactName:
        payload.contactName !== undefined ? (payload.contactName ?? null) : partner.contactName,
      discountPercentage:
        payload.discountPercentage !== undefined
          ? payload.discountPercentage
          : partner.discountPercentage,
      partnershipStartDate: payload.partnershipStartDate
        ? DateTime.fromJSDate(payload.partnershipStartDate)
        : partner.partnershipStartDate,
      partnershipEndDate:
        payload.partnershipEndDate !== undefined
          ? payload.partnershipEndDate
            ? DateTime.fromJSDate(payload.partnershipEndDate)
            : null
          : partner.partnershipEndDate,
      isActive: payload.isActive !== undefined ? payload.isActive : partner.isActive,
    })

    await partner.save()

    return response.ok(partner)
  }
}
