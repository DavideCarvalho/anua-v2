import type { HttpContext } from '@adonisjs/core/http'
import Class_ from '#models/class'
import ListClassesResponseDto from './dtos/list_classes_response.dto.js'

export default class ListClassesController {
  async handle(ctx: HttpContext) {
    const { request, selectedSchoolIds } = ctx
    const page = request.input('page', 1)
    const limit = request.input('limit', 20)
    const search = request.input('search', '')
    const levelId = request.input('levelId')
    const schoolId = request.input('schoolId')
    const status = request.input('status')
    const academicPeriodId = request.input('academicPeriodId')

    // Use schoolId from request (for admins) or selectedSchoolIds from middleware
    const schoolIds = schoolId ? [schoolId] : selectedSchoolIds

    const query = Class_.query()
      .preload('level')
      .withCount('studentLevels', (q) => {
        q.whereNull('deletedAt').whereHas('academicPeriod', (periodQ) => {
          periodQ.where('isActive', true).whereNull('deletedAt')
        })
      })
      .orderBy('name', 'asc')

    if (search) {
      query.whereILike('name', `%${search}%`)
    }

    if (levelId) {
      query.where('levelId', levelId)
    }

    if (schoolIds && schoolIds.length > 0) {
      query.whereIn('schoolId', schoolIds)
    }

    if (status) {
      query.where('status', status)
    }

    if (academicPeriodId) {
      query.whereHas('academicPeriods', (periodQ) => {
        periodQ.where('AcademicPeriod.id', academicPeriodId).whereNull('AcademicPeriod.deletedAt')
      })
    } else {
      query.whereHas('academicPeriods', (periodQ) => {
        periodQ.where('AcademicPeriod.isActive', true).whereNull('AcademicPeriod.deletedAt')
      })
    }

    const classes = await query.paginate(page, limit)

    return ListClassesResponseDto.fromPaginator(classes)
  }
}
