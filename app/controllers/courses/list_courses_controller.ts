import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import CourseTransformer from '#transformers/course_transformer'
import { listCoursesValidator } from '#validators/course'

export default class ListCoursesController {
  async handle(ctx: HttpContext) {
    const { request, serialize, selectedSchoolIds } = ctx
    const filters = await request.validateUsing(listCoursesValidator)
    const page = filters.page ?? 1
    const limit = filters.limit ?? 20
    const search = filters.search ?? ''
    const schoolId = filters.schoolId
    const academicPeriodId = filters.academicPeriodId

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Course.query().orderBy('name', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    if (academicPeriodId) {
      query.whereHas('academicPeriods', (builder) => {
        builder.where('academic_periods.id', academicPeriodId)
      })
    }

    const courses = await query.paginate(page, limit)
    const data = courses.all()
    const metadata = courses.getMeta()

    return serialize(CourseTransformer.paginate(data, metadata))
  }
}
