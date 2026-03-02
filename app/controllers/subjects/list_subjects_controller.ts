import type { HttpContext } from '@adonisjs/core/http'
import Subject from '#models/subject'
import SubjectTransformer from '#transformers/subject_transformer'
import { listSubjectsValidator } from '#validators/subject'

export default class ListSubjectsController {
  async handle(ctx: HttpContext) {
    const { request, serialize, selectedSchoolIds } = ctx
    const filters = await request.validateUsing(listSubjectsValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const search = filters.search ?? ''
    const schoolId = filters.schoolId

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Subject.query().preload('school').orderBy('name', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    const subjects = await query.paginate(page, limit)
    const data = subjects.all()
    const metadata = subjects.getMeta()

    return serialize(SubjectTransformer.paginate(data, metadata))
  }
}
