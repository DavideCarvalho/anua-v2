import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'
import CourseDto from '#models/dto/course.dto'

export default class ListCoursesController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds } = ctx
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolId = request.input('schoolId')
    const academicPeriodId = request.input('academicPeriodId')

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

    return CourseDto.fromPaginator(courses)
  }
}
