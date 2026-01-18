import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'

export default class ListLevelsController {
  async handle({ request, response }: HttpContext) {
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const courseId = request.input('courseId')
    const schoolId = request.input('schoolId')
    const academicPeriodId = request.input('academicPeriodId')

    const query = Level.query().preload('course').preload('classes').orderBy('order', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (courseId) {
      query.where('courseId', courseId)
    }

    if (schoolId) {
      query.whereHas('course', (builder) => {
        builder.where('school_id', schoolId)
      })
    }

    if (academicPeriodId) {
      query.whereHas('academicPeriods', (builder) => {
        builder.where('academic_periods.id', academicPeriodId)
      })
    }

    const levels = await query.paginate(page, limit)

    return response.ok(levels)
  }
}
