import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import ScholarshipDto from '#models/dto/scholarship.dto'
import { listScholarshipsValidator } from '#validators/scholarship'

export default class ListScholarshipsController {
  async handle({ request, auth }: HttpContext) {
    const payload = await request.validateUsing(listScholarshipsValidator)

    const page = payload.page ?? 1
    const limit = payload.limit ?? 10

    const schoolId = payload.schoolId ?? auth.user?.schoolId

    const query = Scholarship.query().orderBy('name', 'asc')

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (payload.search) {
      query.where('name', 'ilike', `%${payload.search}%`)
    }

    if (payload.active !== undefined) {
      query.where('isActive', payload.active)
    }

    const scholarships = await query.paginate(page, limit)

    return ScholarshipDto.fromPaginator(scholarships)
  }
}
