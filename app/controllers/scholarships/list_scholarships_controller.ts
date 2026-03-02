import type { HttpContext } from '@adonisjs/core/http'
import Scholarship from '#models/scholarship'
import ScholarshipTransformer from '#transformers/scholarship_transformer'
import { listScholarshipsValidator } from '#validators/scholarship'

export default class ListScholarshipsController {
  async handle({ request, auth, serialize }: HttpContext) {
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
    const data = scholarships.all()
    const metadata = scholarships.getMeta()

    return serialize(ScholarshipTransformer.paginate(data, metadata))
  }
}
