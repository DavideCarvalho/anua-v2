import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import { listScholarshipsValidator } from '#validators/scholarship'

export default class ListScholarshipsController {
  async handle({ request, response, auth }: HttpContext) {
    const payload = await request.validateUsing(listScholarshipsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const schoolId = payload.schoolId ?? auth.user?.schoolId

    const query = Scholarship.query().preload('schoolPartner').orderBy('createdAt', 'desc')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    const scholarships = await query.paginate(page, limit)

    return response.ok(scholarships)
  }
}
