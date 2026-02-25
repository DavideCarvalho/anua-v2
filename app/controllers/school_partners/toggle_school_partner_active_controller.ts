import type { HttpContext } from '@adonisjs/core/http'
import SchoolPartner from '#models/school_partner'
import SchoolPartnerDto from '#models/dto/school_partner.dto'
import AppException from '#exceptions/app_exception'

export default class ToggleSchoolPartnerActiveController {
  async handle({ params, response }: HttpContext) {
    const partner = await SchoolPartner.find(params.id)
    if (!partner) {
      throw AppException.notFound('Parceiro não encontrado')
    }

    partner.isActive = !partner.isActive
    await partner.save()

    return response.ok(new SchoolPartnerDto(partner))
  }
}
