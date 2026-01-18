import type { HttpContext } from '@adonisjs/core/http'
import SchoolPartner from '#models/school_partner'

export default class ShowSchoolPartnerController {
  async handle({ params, response }: HttpContext) {
    const partner = await SchoolPartner.find(params.id)

    if (!partner) {
      return response.notFound({ message: 'Parceiro não encontrado' })
    }

    return response.ok(partner)
  }
}
