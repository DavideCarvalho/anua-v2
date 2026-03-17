import type { HttpContext } from '@adonisjs/core/http'
import SchoolPartner from '#models/school_partner'
import AppException from '#exceptions/app_exception'
import SchoolPartnerTransformer from '#transformers/school_partner_transformer'

export default class ShowSchoolPartnerController {
  async handle({ params, response, serialize }: HttpContext) {
    const partner = await SchoolPartner.find(params.id)

    if (!partner) {
      throw AppException.notFound('Parceiro não encontrado')
    }

    return response.ok(await serialize(SchoolPartnerTransformer.transform(partner)))
  }
}
