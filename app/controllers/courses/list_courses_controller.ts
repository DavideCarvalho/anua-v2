import type { HttpContext } from '@adonisjs/core/http'
import Course from '#models/course'

export default class ListCoursesController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const schoolId = request.input('schoolId')
    const academicPeriodId = request.input('academicPeriodId')

    const query = Course.query().preload('levels').orderBy('name', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (academicPeriodId) {
      query.whereHas('academicPeriods', (builder) => {
        builder.where('academic_periods.id', academicPeriodId)
      })
    }

    const courses = await query.paginate(page, limit)

    return response.ok(courses)
  }
}
