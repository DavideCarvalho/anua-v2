import type { HttpContext } from '@adonisjs/core/http'
import SchoolPartner from '#models/school_partner'
import SchoolPartnerDto from '#models/dto/school_partner.dto'
import { listSchoolPartnersValidator } from '#validators/school_partner'

export default class ListSchoolPartnersController {
  async handle({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(listSchoolPartnersValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const schoolId = payload.schoolId ?? auth.user?.schoolId

    const query = SchoolPartner.query().orderBy('createdAt', 'desc')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const partners = await query.paginate(page, limit)

    return SchoolPartnerDto.fromPaginator(partners)
  }
}
