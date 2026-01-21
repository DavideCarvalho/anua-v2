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

    const query = Level.query().preload('school').preload('classes').orderBy('order', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (schoolId) {
      query.where('schoolId', schoolId)
    }

    if (courseId || academicPeriodId) {
      query.whereHas('levelAssignments', (builder) => {
        builder.whereHas('courseHasAcademicPeriod', (courseHasAcademicPeriodBuilder) => {
          if (courseId) {
            courseHasAcademicPeriodBuilder.where('courseId', courseId)
          }
          if (academicPeriodId) {
            courseHasAcademicPeriodBuilder.where('academicPeriodId', academicPeriodId)
          }
        })
      })
    }

    const levels = await query.paginate(page, limit)

    return response.ok(levels)
  }
}
