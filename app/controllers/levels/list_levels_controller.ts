import type { HttpContext } from '@adonisjs/core/http'
import Level from '#models/level'
import LevelDto from '#models/dto/level.dto'

export default class ListLevelsController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds } = ctx
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const courseId = request.input('courseId')
    const schoolId = request.input('schoolId')
    const academicPeriodId = request.input('academicPeriodId')

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Level.query().preload('school').preload('classes').orderBy('order', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
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

    return LevelDto.fromPaginator(levels)
  }
}
