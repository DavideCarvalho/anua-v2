import type { HttpContext } from '@adonisjs/core/http'
import SchoolPartner from '#models/school_partner'

export default class ToggleSchoolPartnerActiveController {
  async handle({ params, response }: HttpContext) {
    const partner = await SchoolPartner.find(params.id)
    if (!partner) {
      return response.notFound({ message: 'Parceiro não encontrado' })
    }

    partner.isActive = !partner.isActive
    await partner.save()

    return response.ok(partner)
  }
}
